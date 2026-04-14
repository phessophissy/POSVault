import type { ClarityValue } from '@stacks/transactions';
import type { ContractNames, POSVaultConfig } from './types.js';
import { resolveConfig, getContractId } from './config.js';

export interface MulticallRequest {
  contract: keyof ContractNames;
  functionName: string;
  args: ClarityValue[];
  sender: string;
  label?: string;
}

export interface MulticallResult<T = any> {
  request: MulticallRequest;
  result: T | null;
  error: string | null;
  durationMs: number;
  retryCount: number;
}

export interface MulticallOptions extends POSVaultConfig {
  concurrency?: number;
  abortOnError?: boolean;
  timeoutMs?: number;
  retries?: number;
}

async function executeOne(
  req: MulticallRequest,
  config: ReturnType<typeof resolveConfig>,
): Promise<MulticallResult> {
  const start = Date.now();
  try {
    const { fetchCallReadOnlyFunction, cvToJSON } = await import('@stacks/transactions');
    const contractId = getContractId(config, req.contract);
    const [contractAddress, contractName] = contractId.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: req.functionName,
      functionArgs: req.args,
      senderAddress: req.sender,
      network: config.network,
    });

    return {
      request: req,
      result: cvToJSON(result),
      error: null,
      durationMs: Date.now() - start,
      retryCount: 0,
    };
  } catch (err: any) {
    return {
      request: req,
      result: null,
      error: err.message ?? String(err),
      durationMs: Date.now() - start,
      retryCount: 0,
    };
  }
}

async function executeWithRetry(
  req: MulticallRequest,
  config: ReturnType<typeof resolveConfig>,
  maxRetries: number,
  timeoutMs?: number,
): Promise<MulticallResult> {
  let lastResult: MulticallResult | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 200ms, 400ms, 800ms, ...
      const delay = Math.min(200 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const controller = timeoutMs ? new AbortController() : null;
    const timer = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

    try {
      lastResult = await executeOne(req, config);
      if (timer) clearTimeout(timer);

      if (lastResult.error === null) {
        lastResult.retryCount = attempt;
        return lastResult;
      }
    } catch {
      if (timer) clearTimeout(timer);
    }
  }

  // All retries exhausted – return the last failed result
  if (lastResult) {
    lastResult.retryCount = maxRetries;
    return lastResult;
  }

  return {
    request: req,
    result: null,
    error: `All ${maxRetries + 1} attempts failed`,
    durationMs: 0,
    retryCount: maxRetries,
  };
}

export async function multicall(
  requests: MulticallRequest[],
  opts?: MulticallOptions,
): Promise<MulticallResult[]> {
  const config = resolveConfig(opts);
  const concurrency = opts?.concurrency ?? 5;
  const abortOnError = opts?.abortOnError ?? false;
  const retries = opts?.retries ?? 0;
  const timeoutMs = opts?.timeoutMs;

  const results: MulticallResult[] = [];
  const queue = [...requests];

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchResults = await Promise.all(
      batch.map((req) => executeWithRetry(req, config, retries, timeoutMs)),
    );

    for (const r of batchResults) {
      results.push(r);
      if (abortOnError && r.error) {
        return results;
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Convenience: fetch all vault data for a user in one batch
// ---------------------------------------------------------------------------

export async function fetchUserDashboard(
  userAddress: string,
  opts?: MulticallOptions,
) {
  const config = resolveConfig(opts);
  const vaultCore = config.contractNames.vaultCore;
  const govToken = config.contractNames.governanceToken;

  const { principalCV } = await import('@stacks/transactions');

  const requests: MulticallRequest[] = [
    { contract: 'vaultCore', functionName: 'get-vault-info', args: [], sender: userAddress },
    { contract: 'vaultCore', functionName: 'get-deposit', args: [principalCV(userAddress)], sender: userAddress },
    { contract: 'vaultCore', functionName: 'get-user-stats', args: [principalCV(userAddress)], sender: userAddress },
    { contract: 'vaultCore', functionName: 'get-pending-rewards', args: [principalCV(userAddress)], sender: userAddress },
    { contract: 'governanceToken', functionName: 'get-balance', args: [principalCV(userAddress)], sender: userAddress },
    { contract: 'governanceToken', functionName: 'get-total-supply', args: [], sender: userAddress },
  ];

  const results = await multicall(requests, opts);

  return {
    vaultInfo: results[0].result,
    deposit: results[1].result,
    userStats: results[2].result,
    pendingRewards: results[3].result,
    tokenBalance: results[4].result,
    totalSupply: results[5].result,
    errors: results.filter((r) => r.error).map((r) => r.error!),
    totalDurationMs: results.reduce((sum, r) => sum + r.durationMs, 0),
  };
}

// ---------------------------------------------------------------------------
// Convenience: fetch all proposals
// ---------------------------------------------------------------------------

export async function fetchAllProposals(
  senderAddress: string,
  proposalCount: number,
  opts?: MulticallOptions,
) {
  const { uintCV } = await import('@stacks/transactions');

  const requests: MulticallRequest[] = [];
  for (let i = 1; i <= proposalCount; i++) {
    requests.push({
      contract: 'proposalVoting',
      functionName: 'get-proposal',
      args: [uintCV(i)],
      sender: senderAddress,
    });
  }

  const results = await multicall(requests, opts);
  return results
    .filter((r) => r.result !== null)
    .map((r, idx) => ({ id: idx + 1, ...r.result }));
}

// ---------------------------------------------------------------------------
// Fetch governance summary (proposal count + votes for N proposals)
// ---------------------------------------------------------------------------

export async function fetchGovernanceSummary(
  senderAddress: string,
  proposalCount: number,
  opts?: MulticallOptions,
) {
  const { uintCV, principalCV } = await import('@stacks/transactions');

  const requests: MulticallRequest[] = [
    { contract: 'proposalVoting', functionName: 'get-proposal-count', args: [], sender: senderAddress },
  ];

  for (let i = 1; i <= Math.min(proposalCount, 10); i++) {
    requests.push({
      contract: 'proposalVoting',
      functionName: 'get-proposal',
      args: [uintCV(i)],
      sender: senderAddress,
    });
    requests.push({
      contract: 'proposalVoting',
      functionName: 'get-vote-record',
      args: [uintCV(i), principalCV(senderAddress)],
      sender: senderAddress,
    });
  }

  const results = await multicall(requests, opts);
  return {
    proposalCount: results[0]?.result,
    proposals: results.slice(1).filter((_, i) => i % 2 === 0).map((r) => r.result),
    userVotes: results.slice(1).filter((_, i) => i % 2 === 1).map((r) => r.result),
    errors: results.filter((r) => r.error).map((r) => r.error!),
  };
}

// ---------------------------------------------------------------------------
// Multicall statistics helpers
// ---------------------------------------------------------------------------

export interface MulticallStats {
  total: number;
  succeeded: number;
  failed: number;
  totalDurationMs: number;
  avgDurationMs: number;
  maxDurationMs: number;
}

export function getMulticallStats(results: MulticallResult[]): MulticallStats {
  const succeeded = results.filter((r) => r.error === null).length;
  const durations = results.map((r) => r.durationMs);
  const totalDurationMs = durations.reduce((a, b) => a + b, 0);

  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    totalDurationMs,
    avgDurationMs: results.length > 0 ? Math.round(totalDurationMs / results.length) : 0,
    maxDurationMs: durations.length > 0 ? Math.max(...durations) : 0,
  };
}
