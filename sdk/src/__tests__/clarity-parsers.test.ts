import { describe, it, expect } from 'vitest';
import {
  parseDepositRecord,
  parseVaultInfo,
  parseUserStats,
  parseProposal,
  parseProposalResult,
  parseVoteRecord,
  parseWithdrawResult,
} from '../clarity-parsers.js';

describe('clarity-parsers', () => {
  describe('parseDepositRecord', () => {
    it('parses a Clarity tuple JSON shape', () => {
      const cv = {
        type: 'tuple',
        value: {
          amount: { type: 'uint', value: '1000000' },
          'deposit-block': { type: 'uint', value: '100' },
          'last-claim-block': { type: 'uint', value: '100' },
          'total-rewards-claimed': { type: 'uint', value: '0' },
        },
      };
      const result = parseDepositRecord(cv);
      expect(result.amount).toBe(1000000n);
      expect(result.depositBlock).toBe(100n);
      expect(result.lastClaimBlock).toBe(100n);
      expect(result.totalRewardsClaimed).toBe(0n);
    });

    it('parses plain bigint objects', () => {
      const result = parseDepositRecord({
        amount: 500n,
        'deposit-block': 10n,
        'last-claim-block': 10n,
        'total-rewards-claimed': 0n,
      });
      expect(result.amount).toBe(500n);
    });
  });

  describe('parseVaultInfo', () => {
    it('parses a Clarity tuple JSON shape', () => {
      const cv = {
        type: 'tuple',
        value: {
          'total-stx-locked': { type: 'uint', value: '5000000' },
          'total-depositors': { type: 'uint', value: '3' },
          'reward-rate': { type: 'uint', value: '100' },
          'is-paused': { type: 'bool', value: false },
          'current-block': { type: 'uint', value: '500' },
        },
      };
      const result = parseVaultInfo(cv);
      expect(result.totalStxLocked).toBe(5000000n);
      expect(result.isPaused).toBe(false);
      expect(result.rewardRate).toBe(100n);
    });
  });

  describe('parseUserStats', () => {
    it('parses from Clarity JSON', () => {
      const cv = {
        type: 'tuple',
        value: {
          'total-deposited': { type: 'uint', value: '2000000' },
          'total-withdrawn': { type: 'uint', value: '500000' },
          'total-rewards': { type: 'uint', value: '1000' },
          'deposit-count': { type: 'uint', value: '2' },
        },
      };
      const result = parseUserStats(cv);
      expect(result.totalDeposited).toBe(2000000n);
      expect(result.depositCount).toBe(2n);
    });
  });

  describe('parseProposal', () => {
    it('parses a full proposal tuple', () => {
      const cv = {
        type: 'tuple',
        value: {
          proposer: { type: 'principal', value: 'SP2KYZ' },
          title: { type: 'string-utf8', value: 'Test Proposal' },
          description: { type: 'string-utf8', value: 'A test' },
          'proposal-type': { type: 'string-ascii', value: 'general' },
          value: { type: 'uint', value: '0' },
          'start-block': { type: 'uint', value: '100' },
          'end-block': { type: 'uint', value: '244' },
          'votes-for': { type: 'uint', value: '10' },
          'votes-against': { type: 'uint', value: '2' },
          'total-voters': { type: 'uint', value: '3' },
          executed: { type: 'bool', value: false },
          passed: { type: 'bool', value: false },
        },
      };
      const result = parseProposal(cv);
      expect(result.proposer).toBe('SP2KYZ');
      expect(result.title).toBe('Test Proposal');
      expect(result.votesFor).toBe(10n);
      expect(result.executed).toBe(false);
    });
  });

  describe('parseVoteRecord', () => {
    it('parses a vote record tuple', () => {
      const cv = {
        type: 'tuple',
        value: {
          amount: { type: 'uint', value: '5000000' },
          support: { type: 'bool', value: true },
        },
      };
      const result = parseVoteRecord(cv);
      expect(result.amount).toBe(5000000n);
      expect(result.support).toBe(true);
    });
  });

  describe('parseWithdrawResult', () => {
    it('parses a withdraw result tuple', () => {
      const cv = {
        type: 'tuple',
        value: {
          'stx-returned': { type: 'uint', value: '1000000' },
          'rewards-earned': { type: 'uint', value: '5000' },
        },
      };
      const result = parseWithdrawResult(cv);
      expect(result.stxReturned).toBe(1000000n);
      expect(result.rewardsEarned).toBe(5000n);
    });
  });

  describe('parseProposalResult', () => {
    it('parses a proposal result tuple', () => {
      const cv = {
        type: 'tuple',
        value: {
          passed: { type: 'bool', value: true },
          'votes-for': { type: 'uint', value: '20' },
          'votes-against': { type: 'uint', value: '5' },
          'total-voters': { type: 'uint', value: '10' },
          executed: { type: 'bool', value: false },
          'voting-ended': { type: 'bool', value: true },
        },
      };
      const result = parseProposalResult(cv);
      expect(result.passed).toBe(true);
      expect(result.votesFor).toBe(20n);
      expect(result.votingEnded).toBe(true);
    });
  });

  describe('error handling', () => {
    it('throws TypeError for invalid Clarity value', () => {
      expect(() =>
        parseDepositRecord({
          type: 'tuple',
          value: {
            amount: { type: 'list', value: [] },
          },
        }),
      ).toThrow(TypeError);
    });
  });
});
