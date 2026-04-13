import type {
  DepositRecord,
  UserStats,
  VaultInfo,
  Proposal,
  ProposalResult,
  VoteRecord,
  WithdrawResult,
  ContractNames,
  POSVaultConfig,
} from './types.js';
import {
  isDepositRecord,
  isVaultInfo,
  isUserStats,
  isProposal,
  isProposalResult,
  isVoteRecord,
} from './guards.js';
import { POSVaultError } from './errors.js';

// ---------------------------------------------------------------------------
// Assertion helpers – throw if the guard fails
// ---------------------------------------------------------------------------

export function assertDepositRecord(
  value: unknown,
  context?: string,
): asserts value is DepositRecord {
  if (!isDepositRecord(value)) {
    throw new POSVaultError(
      `Expected DepositRecord${context ? ` (${context})` : ''}, got ${typeof value}`,
    );
  }
}

export function assertVaultInfo(
  value: unknown,
  context?: string,
): asserts value is VaultInfo {
  if (!isVaultInfo(value)) {
    throw new POSVaultError(
      `Expected VaultInfo${context ? ` (${context})` : ''}, got ${typeof value}`,
    );
  }
}

export function assertUserStats(
  value: unknown,
  context?: string,
): asserts value is UserStats {
  if (!isUserStats(value)) {
    throw new POSVaultError(
      `Expected UserStats${context ? ` (${context})` : ''}, got ${typeof value}`,
    );
  }
}

export function assertProposal(
  value: unknown,
  context?: string,
): asserts value is Proposal {
  if (!isProposal(value)) {
    throw new POSVaultError(
      `Expected Proposal${context ? ` (${context})` : ''}, got ${typeof value}`,
    );
  }
}

export function assertProposalResult(
  value: unknown,
  context?: string,
): asserts value is ProposalResult {
  if (!isProposalResult(value)) {
    throw new POSVaultError(
      `Expected ProposalResult${context ? ` (${context})` : ''}, got ${typeof value}`,
    );
  }
}

export function assertVoteRecord(
  value: unknown,
  context?: string,
): asserts value is VoteRecord {
  if (!isVoteRecord(value)) {
    throw new POSVaultError(
      `Expected VoteRecord${context ? ` (${context})` : ''}, got ${typeof value}`,
    );
  }
}
