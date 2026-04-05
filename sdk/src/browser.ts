import {
  Pc,
  PostConditionMode,
  principalCV,
  uintCV,
  boolCV,
  stringUtf8CV,
  stringAsciiCV,
  type ClarityValue,
} from '@stacks/transactions';
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';
import type { ContractNames } from './types.js';

export interface ContractCallCallbacks {
  onFinish?: (data: { txId: string; stacksTransaction: any }) => void;
  onCancel?: (error?: Error) => void;
}

export interface BrowserOptions {
  deployer?: string;
  contractNames?: Partial<ContractNames>;
  network?: 'mainnet' | 'testnet';
}

function resolveConfig(opts?: BrowserOptions) {
  const deployer = opts?.deployer ?? DEPLOYER;
  const names = { ...CONTRACT_NAMES, ...opts?.contractNames };
  const network = opts?.network ?? 'mainnet';
  return { deployer, names, network };
}

async function executeContractCall(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  postConditions: any[],
  callbacks: ContractCallCallbacks,
  opts?: BrowserOptions,
) {
  const { openContractCall } = await import('@stacks/connect');
  const { deployer, network } = resolveConfig(opts);

  await openContractCall({
    contractAddress: deployer,
    contractName,
    functionName,
    functionArgs,
    network,
    postConditionMode:
      postConditions.length > 0 ? PostConditionMode.Deny : PostConditionMode.Allow,
    postConditions,
    onFinish: callbacks.onFinish as any,
    onCancel: callbacks.onCancel,
  });
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export async function connectWallet(
  onFinish: (data: { userSession: any; authResponse?: string }) => void,
  onCancel?: (error?: Error) => void,
) {
  const { authenticate } = await import('@stacks/connect');
  authenticate({ onFinish, onCancel });
}

export async function disconnectWallet(userSession: any) {
  userSession.signUserOut();
}

// ---------------------------------------------------------------------------
// Vault
// ---------------------------------------------------------------------------

export async function depositSTX(
  amountSTX: number,
  senderAddress: string,
  callbacks: ContractCallCallbacks,
  opts?: BrowserOptions,
) {
  const { names } = resolveConfig(opts);
  const amountMicro = Math.round(amountSTX * 1_000_000);
  const postConditions = [
    Pc.principal(senderAddress).willSendEq(amountMicro).ustx(),
  ];
  return executeContractCall(
    names.vaultCore,
    'deposit',
    [uintCV(amountMicro)],
    postConditions,
    callbacks,
    opts,
  );
}

export async function withdrawSTX(callbacks: ContractCallCallbacks, opts?: BrowserOptions) {
  const { names } = resolveConfig(opts);
  return executeContractCall(names.vaultCore, 'withdraw', [], [], callbacks, opts);
}

export async function claimRewards(callbacks: ContractCallCallbacks, opts?: BrowserOptions) {
  const { names } = resolveConfig(opts);
  return executeContractCall(names.vaultCore, 'claim-rewards', [], [], callbacks, opts);
}

// ---------------------------------------------------------------------------
// Governance
// ---------------------------------------------------------------------------

export async function createProposal(
  title: string,
  description: string,
  proposalType: 'general' | 'reward-rate' | 'pause',
  value: number,
  callbacks: ContractCallCallbacks,
  opts?: BrowserOptions,
) {
  const { names } = resolveConfig(opts);
  return executeContractCall(
    names.proposalVoting,
    'create-proposal',
    [stringUtf8CV(title), stringUtf8CV(description), stringAsciiCV(proposalType), uintCV(value)],
    [],
    callbacks,
    opts,
  );
}

export async function voteOnProposal(
  proposalId: number,
  support: boolean,
  callbacks: ContractCallCallbacks,
  opts?: BrowserOptions,
) {
  const { names } = resolveConfig(opts);
  return executeContractCall(
    names.proposalVoting,
    'vote',
    [uintCV(proposalId), boolCV(support)],
    [],
    callbacks,
    opts,
  );
}

export async function executeProposal(
  proposalId: number,
  callbacks: ContractCallCallbacks,
  opts?: BrowserOptions,
) {
  const { names } = resolveConfig(opts);
  return executeContractCall(
    names.proposalVoting,
    'execute-proposal',
    [uintCV(proposalId)],
    [],
    callbacks,
    opts,
  );
}
