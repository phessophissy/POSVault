import {
  cvToJSON,
  fetchCallReadOnlyFunction,
  principalCV,
  uintCV,
  type ClarityValue,
} from '@stacks/transactions';
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';
import type { ContractNames } from './types.js';

export interface ReadOnlyOptions {
  deployer?: string;
  contractNames?: Partial<ContractNames>;
  network?: 'mainnet' | 'testnet';
}

function resolveConfig(opts?: ReadOnlyOptions) {
  const deployer = opts?.deployer ?? DEPLOYER;
  const names = { ...CONTRACT_NAMES, ...opts?.contractNames };
  const network = opts?.network ?? 'mainnet';
  return { deployer, names, network };
}

export async function callReadOnly(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  senderAddress: string,
  opts?: ReadOnlyOptions,
) {
  const { deployer, network } = resolveConfig(opts);
  const result = await fetchCallReadOnlyFunction({
    contractAddress: deployer,
    contractName,
    functionName,
    functionArgs,
    senderAddress,
    network,
  });
  return cvToJSON(result);
}

// ---------------------------------------------------------------------------
// Vault read-only helpers
// ---------------------------------------------------------------------------

export async function getVaultInfo(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.vaultCore, 'get-vault-info', [], senderAddress, opts);
  const v = res.value?.value ?? res.value;
  return {
    totalStxLocked: BigInt(v['total-stx-locked'].value),
    totalDepositors: BigInt(v['total-depositors'].value),
    rewardRate: BigInt(v['reward-rate'].value),
    isPaused: v['is-paused'].value,
    currentBlock: BigInt(v['current-block'].value),
  };
}

export async function getDeposit(depositor: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.vaultCore,
    'get-deposit',
    [principalCV(depositor)],
    depositor,
    opts,
  );
  if (!res.value) return null;
  const v = res.value;
  return {
    amount: BigInt(v.amount.value),
    depositBlock: BigInt(v['deposit-block'].value),
    lastClaimBlock: BigInt(v['last-claim-block'].value),
    totalRewardsClaimed: BigInt(v['total-rewards-claimed'].value),
  };
}

export async function getUserStats(userAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.vaultCore,
    'get-user-stats',
    [principalCV(userAddress)],
    userAddress,
    opts,
  );
  const v = res.value ?? res;
  return {
    totalDeposited: BigInt(v['total-deposited'].value),
    totalWithdrawn: BigInt(v['total-withdrawn'].value),
    totalRewards: BigInt(v['total-rewards'].value),
    depositCount: BigInt(v['deposit-count'].value),
  };
}

export async function getPendingRewards(depositor: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.vaultCore,
    'get-pending-rewards',
    [principalCV(depositor)],
    depositor,
    opts,
  );
  return BigInt(res.value?.value ?? res.value);
}

export async function getRewardRate(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.vaultCore, 'get-reward-rate', [], senderAddress, opts);
  return BigInt(res.value?.value ?? res.value);
}

export async function isPaused(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.vaultCore, 'is-paused', [], senderAddress, opts);
  return Boolean(res.value?.value ?? res.value);
}

// ---------------------------------------------------------------------------
// Governance Token read-only helpers
// ---------------------------------------------------------------------------

export async function getTokenBalance(account: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.governanceToken,
    'get-balance',
    [principalCV(account)],
    account,
    opts,
  );
  return BigInt(res.value?.value ?? res.value);
}

export async function getTotalSupply(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.governanceToken, 'get-total-supply', [], senderAddress, opts);
  return BigInt(res.value?.value ?? res.value);
}

export async function getTotalMinted(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.governanceToken, 'get-total-minted', [], senderAddress, opts);
  return BigInt(res.value?.value ?? res.value);
}

export async function isMinter(account: string, senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.governanceToken,
    'is-minter',
    [principalCV(account)],
    senderAddress,
    opts,
  );
  return Boolean(res.value?.value ?? res.value);
}

export async function getMintingStatus(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.governanceToken, 'get-minting-status', [], senderAddress, opts);
  return Boolean(res.value?.value ?? res.value);
}

// ---------------------------------------------------------------------------
// Proposal Voting read-only helpers
// ---------------------------------------------------------------------------

export async function getProposal(proposalId: number, senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.proposalVoting,
    'get-proposal',
    [uintCV(proposalId)],
    senderAddress,
    opts,
  );
  if (!res.value) return null;
  const v = res.value;
  return {
    proposer: String(v.proposer.value),
    title: String(v.title.value),
    description: String(v.description.value),
    proposalType: String(v['proposal-type'].value),
    value: BigInt(v.value.value),
    startBlock: BigInt(v['start-block'].value),
    endBlock: BigInt(v['end-block'].value),
    votesFor: BigInt(v['votes-for'].value),
    votesAgainst: BigInt(v['votes-against'].value),
    totalVoters: BigInt(v['total-voters'].value),
    executed: Boolean(v.executed.value),
    passed: Boolean(v.passed.value),
  };
}

export async function getProposalCount(senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(names.proposalVoting, 'get-proposal-count', [], senderAddress, opts);
  return BigInt(res.value?.value ?? res.value);
}

export async function getProposalResult(proposalId: number, senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.proposalVoting,
    'get-proposal-result',
    [uintCV(proposalId)],
    senderAddress,
    opts,
  );
  const v = res.value?.value ?? res.value;
  return {
    passed: Boolean(v.passed.value),
    votesFor: BigInt(v['votes-for'].value),
    votesAgainst: BigInt(v['votes-against'].value),
    totalVoters: BigInt(v['total-voters'].value),
    executed: Boolean(v.executed.value),
    votingEnded: Boolean(v['voting-ended'].value),
  };
}

export async function getVoteRecord(
  proposalId: number,
  voter: string,
  opts?: ReadOnlyOptions,
) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.proposalVoting,
    'get-vote-record',
    [uintCV(proposalId), principalCV(voter)],
    voter,
    opts,
  );
  if (!res.value) return null;
  const v = res.value;
  return {
    amount: BigInt(v.amount.value),
    support: Boolean(v.support.value),
  };
}

export async function isVotingActive(proposalId: number, senderAddress: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.proposalVoting,
    'is-voting-active',
    [uintCV(proposalId)],
    senderAddress,
    opts,
  );
  return Boolean(res.value?.value ?? res.value);
}

export async function getUserActiveProposal(user: string, opts?: ReadOnlyOptions) {
  const { names } = resolveConfig(opts);
  const res = await callReadOnly(
    names.proposalVoting,
    'get-user-active-proposal',
    [principalCV(user)],
    user,
    opts,
  );
  if (!res.value) return null;
  return BigInt(res.value);
}
