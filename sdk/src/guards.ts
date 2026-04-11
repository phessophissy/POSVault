import type { DepositRecord, UserStats, VaultInfo, Proposal, VoteRecord, ProposalResult } from './types.js';

export function isDepositRecord(value: unknown): value is DepositRecord {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.amount === 'bigint' &&
    typeof obj.depositBlock === 'bigint' &&
    typeof obj.lastClaimBlock === 'bigint' &&
    typeof obj.totalRewardsClaimed === 'bigint'
  );
}

export function isVaultInfo(value: unknown): value is VaultInfo {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.totalStxLocked === 'bigint' &&
    typeof obj.totalDepositors === 'bigint' &&
    typeof obj.rewardRate === 'bigint' &&
    typeof obj.isPaused === 'boolean' &&
    typeof obj.currentBlock === 'bigint'
  );
}

export function isUserStats(value: unknown): value is UserStats {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.totalDeposited === 'bigint' &&
    typeof obj.totalWithdrawn === 'bigint' &&
    typeof obj.totalRewards === 'bigint' &&
    typeof obj.depositCount === 'bigint'
  );
}

export function isProposal(value: unknown): value is Proposal {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.proposer === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.votesFor === 'bigint' &&
    typeof obj.votesAgainst === 'bigint' &&
    typeof obj.executed === 'boolean'
  );
}

export function isVoteRecord(value: unknown): value is VoteRecord {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.amount === 'bigint' && typeof obj.support === 'boolean';
}

export function isProposalResult(value: unknown): value is ProposalResult {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.passed === 'boolean' &&
    typeof obj.votesFor === 'bigint' &&
    typeof obj.votesAgainst === 'bigint' &&
    typeof obj.executed === 'boolean' &&
    typeof obj.votingEnded === 'boolean'
  );
}
