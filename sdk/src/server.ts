import {
  AnchorMode,
  Pc,
  PostConditionMode,
  broadcastTransaction,
  makeContractCall,
  makeSTXTokenTransfer,
  principalCV,
  uintCV,
  type ClarityValue,
} from '@stacks/transactions';
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';
import type { ContractNames } from './types.js';

export interface ServerCallOptions {
  senderKey: string;
  deployer?: string;
  contractNames?: Partial<ContractNames>;
  network?: 'mainnet' | 'testnet';
  fee?: number;
}

function resolveConfig(opts: ServerCallOptions) {
  const deployer = opts.deployer ?? DEPLOYER;
  const names = { ...CONTRACT_NAMES, ...opts.contractNames };
  const network = opts.network ?? 'mainnet';
  return { deployer, names, network };
}

async function broadcastCall(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  postConditions: any[],
  opts: ServerCallOptions,
) {
  const { deployer, network } = resolveConfig(opts);

  const txOptions: any = {
    contractAddress: deployer,
    contractName,
    functionName,
    functionArgs,
    senderKey: opts.senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode:
      postConditions.length > 0 ? PostConditionMode.Deny : PostConditionMode.Allow,
    postConditions,
  };

  if (opts.fee !== undefined) {
    txOptions.fee = opts.fee;
  }

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if (result && typeof result === 'object' && 'txid' in result) {
    return { ok: true as const, txid: (result as any).txid as string };
  }

  return {
    ok: false as const,
    error: typeof result === 'string' ? result : JSON.stringify(result),
  };
}

// ---------------------------------------------------------------------------
// Vault write operations
// ---------------------------------------------------------------------------

export async function deposit(amountMicroSTX: number | bigint, opts: ServerCallOptions) {
  const { deployer, names, network } = resolveConfig(opts);
  const amount = Number(amountMicroSTX);
  const senderAddress = getAddressFromKey(opts.senderKey);

  const postConditions = [
    Pc.principal(senderAddress).willSendEq(amount).ustx(),
  ];

  return broadcastCall(names.vaultCore, 'deposit', [uintCV(amount)], postConditions, opts);
}

export async function withdraw(opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'withdraw', [], [], opts);
}

export async function claimRewards(opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'claim-rewards', [], [], opts);
}

export async function setRewardRate(newRate: number, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'set-reward-rate', [uintCV(newRate)], [], opts);
}

export async function togglePause(opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'toggle-pause', [], [], opts);
}

export async function addAdmin(admin: string, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'add-admin', [principalCV(admin)], [], opts);
}

export async function removeAdmin(admin: string, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'remove-admin', [principalCV(admin)], [], opts);
}

export async function emergencyWithdraw(opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.vaultCore, 'emergency-withdraw', [], [], opts);
}

// ---------------------------------------------------------------------------
// Governance Token write operations
// ---------------------------------------------------------------------------

export async function transferToken(
  amount: number | bigint,
  recipient: string,
  memo: string | null,
  opts: ServerCallOptions,
) {
  const { names } = resolveConfig(opts);
  const senderAddress = getAddressFromKey(opts.senderKey);
  const args: ClarityValue[] = [
    uintCV(Number(amount)),
    principalCV(senderAddress),
    principalCV(recipient),
  ];
  // memo is optional — pass none
  const { noneCV, someCV, bufferCV } = await import('@stacks/transactions');
  args.push(memo ? someCV(bufferCV(new TextEncoder().encode(memo))) : noneCV());
  return broadcastCall(names.governanceToken, 'transfer', args, [], opts);
}

export async function burnToken(amount: number | bigint, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.governanceToken, 'burn', [uintCV(Number(amount))], [], opts);
}

export async function addMinter(minter: string, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.governanceToken, 'add-minter', [principalCV(minter)], [], opts);
}

export async function removeMinter(minter: string, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.governanceToken, 'remove-minter', [principalCV(minter)], [], opts);
}

export async function toggleMinting(opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.governanceToken, 'toggle-minting', [], [], opts);
}

// ---------------------------------------------------------------------------
// Proposal Voting write operations
// ---------------------------------------------------------------------------

export async function createProposal(
  title: string,
  description: string,
  proposalType: 'general' | 'reward-rate' | 'pause',
  value: number,
  opts: ServerCallOptions,
) {
  const { stringUtf8CV, stringAsciiCV } = await import('@stacks/transactions');
  const { names } = resolveConfig(opts);
  return broadcastCall(
    names.proposalVoting,
    'create-proposal',
    [stringUtf8CV(title), stringUtf8CV(description), stringAsciiCV(proposalType), uintCV(value)],
    [],
    opts,
  );
}

export async function vote(proposalId: number, support: boolean, opts: ServerCallOptions) {
  const { boolCV } = await import('@stacks/transactions');
  const { names } = resolveConfig(opts);
  return broadcastCall(
    names.proposalVoting,
    'vote',
    [uintCV(proposalId), boolCV(support)],
    [],
    opts,
  );
}

export async function executeProposal(proposalId: number, opts: ServerCallOptions) {
  const { names } = resolveConfig(opts);
  return broadcastCall(names.proposalVoting, 'execute-proposal', [uintCV(proposalId)], [], opts);
}

// ---------------------------------------------------------------------------
// STX transfer (funding)
// ---------------------------------------------------------------------------

export async function sendSTX(
  recipient: string,
  amountMicroSTX: number | bigint,
  opts: ServerCallOptions,
) {
  const { network } = resolveConfig(opts);

  const txOptions: any = {
    recipient,
    amount: Number(amountMicroSTX),
    senderKey: opts.senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  if (opts.fee !== undefined) {
    txOptions.fee = opts.fee;
  }

  const transaction = await makeSTXTokenTransfer(txOptions);
  const result = await broadcastTransaction({ transaction, network });

  if (result && typeof result === 'object' && 'txid' in result) {
    return { ok: true as const, txid: (result as any).txid as string };
  }

  return {
    ok: false as const,
    error: typeof result === 'string' ? result : JSON.stringify(result),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAddressFromKey(privateKey: string): string {
  const { getAddressFromPrivateKey } = require('@stacks/transactions');
  return getAddressFromPrivateKey(privateKey);
}
