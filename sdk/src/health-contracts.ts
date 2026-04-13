import type { CheckResult, ContractInfo } from './health-types.js';

/**
 * Verifies that the required POSVault contracts are deployed
 * by querying the /v2/contracts/source endpoint for each.
 */
export async function checkContracts(
  apiBaseUrl: string,
  deployer: string,
  contractNames: Record<string, string>,
  timeoutMs: number
): Promise<CheckResult> {
  const start = Date.now();
  const contracts: ContractInfo[] = [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const entries = Object.entries(contractNames);

    const results = await Promise.allSettled(
      entries.map(async ([_key, name]) => {
        const contractId = `${deployer}.${name}`;
        const url = `${apiBaseUrl}/v2/contracts/source/${deployer}/${name}`;

        const response = await fetch(url, { signal: controller.signal });

        return {
          contractId,
          exists: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        } satisfies ContractInfo;
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        contracts.push(result.value);
      } else {
        contracts.push({
          contractId: 'unknown',
          exists: false,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    }

    const latencyMs = Date.now() - start;
    const allExist = contracts.every((c) => c.exists);
    const someExist = contracts.some((c) => c.exists);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    let message: string;

    if (allExist) {
      status = 'healthy';
      message = `All ${contracts.length} contracts deployed`;
    } else if (someExist) {
      status = 'degraded';
      const missing = contracts.filter((c) => !c.exists).map((c) => c.contractId);
      message = `Missing contracts: ${missing.join(', ')}`;
    } else {
      status = 'unhealthy';
      message = 'No contracts found on-chain';
    }

    return {
      name: 'contract-existence',
      status,
      latencyMs,
      message,
      details: { contracts },
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      name: 'contract-existence',
      status: 'unhealthy',
      latencyMs,
      message: `Contract check failed: ${error instanceof Error ? error.message : String(error)}`,
      details: { contracts },
    };
  } finally {
    clearTimeout(timer);
  }
}
