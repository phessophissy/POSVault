import { describe, it, expect } from 'vitest';
import {
  assertDepositRecord,
  assertVaultInfo,
  assertUserStats,
  assertProposal,
  assertProposalResult,
  assertVoteRecord,
} from '../assertions.js';

describe('assertion functions', () => {
  describe('assertDepositRecord', () => {
    it('does not throw for valid deposit record', () => {
      expect(() =>
        assertDepositRecord({
          amount: 1000000n,
          depositBlock: 100n,
          lastClaimBlock: 100n,
          totalRewardsClaimed: 0n,
        }),
      ).not.toThrow();
    });

    it('throws POSVaultError for invalid data', () => {
      expect(() => assertDepositRecord(null)).toThrow('Expected DepositRecord');
    });

    it('includes context in error message', () => {
      expect(() => assertDepositRecord({}, 'getDeposit response')).toThrow(
        'getDeposit response',
      );
    });
  });

  describe('assertVaultInfo', () => {
    it('does not throw for valid vault info', () => {
      expect(() =>
        assertVaultInfo({
          totalStxLocked: 5000000n,
          totalDepositors: 3n,
          rewardRate: 100n,
          isPaused: false,
          currentBlock: 500n,
        }),
      ).not.toThrow();
    });

    it('throws for incomplete data', () => {
      expect(() => assertVaultInfo({ totalStxLocked: 5000000n })).toThrow(
        'Expected VaultInfo',
      );
    });
  });

  describe('assertUserStats', () => {
    it('passes for valid user stats', () => {
      expect(() =>
        assertUserStats({
          totalDeposited: 1000000n,
          totalWithdrawn: 0n,
          totalRewards: 500n,
          depositCount: 1n,
        }),
      ).not.toThrow();
    });

    it('throws for number values', () => {
      expect(() =>
        assertUserStats({
          totalDeposited: 1000000,
          totalWithdrawn: 0,
          totalRewards: 500,
          depositCount: 1,
        }),
      ).toThrow();
    });
  });

  describe('assertProposal', () => {
    it('passes for valid proposal', () => {
      expect(() =>
        assertProposal({
          proposer: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
          title: 'Test',
          votesFor: 10n,
          votesAgainst: 2n,
          executed: false,
        }),
      ).not.toThrow();
    });
  });

  describe('assertProposalResult', () => {
    it('passes for valid result', () => {
      expect(() =>
        assertProposalResult({
          passed: true,
          votesFor: 10n,
          votesAgainst: 2n,
          totalVoters: 3n,
          executed: false,
          votingEnded: true,
        }),
      ).not.toThrow();
    });
  });

  describe('assertVoteRecord', () => {
    it('passes for valid vote record', () => {
      expect(() => assertVoteRecord({ amount: 5n, support: true })).not.toThrow();
    });

    it('throws for missing support field', () => {
      expect(() => assertVoteRecord({ amount: 5n })).toThrow('Expected VoteRecord');
    });
  });
});
