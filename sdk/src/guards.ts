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
