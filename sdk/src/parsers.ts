/**
 * Clarity value parsers for read-only function responses.
 */

import type { DepositRecord, UserStats, VaultInfo, Proposal, ProposalResult, VoteRecord } from './types.js';

type ClarityValue = any;

function extractUint(cv: ClarityValue): bigint {
  if (cv && typeof cv === 'object' && 'value' in cv) {
    return BigInt(cv.value);
  }
  return BigInt(cv ?? 0);
}

function extractBool(cv: ClarityValue): boolean {
  if (cv && typeof cv === 'object' && 'value' in cv) {
    return Boolean(cv.value);
  }
  return Boolean(cv);
}

function extractString(cv: ClarityValue): string {
  if (cv && typeof cv === 'object' && 'value' in cv) {
    return String(cv.value);
  }
  return String(cv ?? '');
}

export function parseVaultInfo(data: Record<string, ClarityValue>): VaultInfo {
  return {
    totalStxLocked: extractUint(data['total-stx-locked']),
    totalDepositors: extractUint(data['total-depositors']),
    rewardRate: extractUint(data['reward-rate']),
    isPaused: extractBool(data['is-paused']),
    currentBlock: extractUint(data['current-block']),
  };
}

export function parseDeposit(data: Record<string, ClarityValue>): DepositRecord {
  return {
    amount: extractUint(data['amount']),
    depositBlock: extractUint(data['deposit-block']),
    lastClaimBlock: extractUint(data['last-claim-block']),
    totalRewardsClaimed: extractUint(data['total-rewards-claimed']),
  };
}

export function parseUserStats(data: Record<string, ClarityValue>): UserStats {
  return {
    totalDeposited: extractUint(data['total-deposited']),
    totalWithdrawn: extractUint(data['total-withdrawn']),
    totalRewards: extractUint(data['total-rewards']),
    depositCount: extractUint(data['deposit-count']),
  };
}

export function parseProposal(data: Record<string, ClarityValue>): Proposal {
  return {
    proposer: extractString(data['proposer']),
    title: extractString(data['title']),
    description: extractString(data['description']),
    proposalType: extractString(data['proposal-type']),
    value: extractUint(data['value']),
    startBlock: extractUint(data['start-block']),
    endBlock: extractUint(data['end-block']),
    votesFor: extractUint(data['votes-for']),
    votesAgainst: extractUint(data['votes-against']),
    totalVoters: extractUint(data['total-voters']),
    executed: extractBool(data['executed']),
    passed: extractBool(data['passed']),
  };
}

export function parseProposalResult(data: Record<string, ClarityValue>): ProposalResult {
  return {
    passed: extractBool(data['passed']),
    votesFor: extractUint(data['votes-for']),
    votesAgainst: extractUint(data['votes-against']),
    totalVoters: extractUint(data['total-voters']),
    executed: extractBool(data['executed']),
    votingEnded: extractBool(data['voting-ended']),
  };
}

export function parseVoteRecord(data: Record<string, ClarityValue>): VoteRecord {
  return {
    amount: extractUint(data['amount']),
    support: extractBool(data['support']),
  };
}
