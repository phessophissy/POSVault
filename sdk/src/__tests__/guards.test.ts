import { describe, it, expect } from 'vitest';
import {
  isNonNullObject,
  isBigInt,
  isStxAddress,
  isDepositRecord,
  isVaultInfo,
  isUserStats,
  isProposal,
  isVoteRecord,
  isProposalResult,
  isWithdrawResult,
  isContractNames,
  isPOSVaultConfig,
} from '../guards.js';

describe('primitive guards', () => {
  describe('isNonNullObject', () => {
    it('returns true for plain objects', () => {
      expect(isNonNullObject({})).toBe(true);
      expect(isNonNullObject({ a: 1 })).toBe(true);
    });
    it('returns false for null, arrays, primitives', () => {
      expect(isNonNullObject(null)).toBe(false);
      expect(isNonNullObject(undefined)).toBe(false);
      expect(isNonNullObject([1, 2])).toBe(false);
      expect(isNonNullObject('string')).toBe(false);
      expect(isNonNullObject(42)).toBe(false);
    });
  });

  describe('isBigInt', () => {
    it('returns true for bigint values', () => {
      expect(isBigInt(0n)).toBe(true);
      expect(isBigInt(BigInt(999))).toBe(true);
    });
    it('returns false for numbers and strings', () => {
      expect(isBigInt(42)).toBe(false);
      expect(isBigInt('42')).toBe(false);
    });
  });

  describe('isStxAddress', () => {
    it('returns true for valid SP addresses', () => {
      expect(isStxAddress('SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09')).toBe(true);
    });
    it('returns true for valid SM addresses', () => {
      expect(isStxAddress('SM2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09')).toBe(true);
    });
    it('returns false for invalid addresses', () => {
      expect(isStxAddress('0x1234')).toBe(false);
      expect(isStxAddress('')).toBe(false);
      expect(isStxAddress(123)).toBe(false);
    });
  });
});

describe('domain type guards', () => {
  const validDeposit = {
    amount: 1000000n,
    depositBlock: 100n,
    lastClaimBlock: 100n,
    totalRewardsClaimed: 0n,
  };

  const validVaultInfo = {
    totalStxLocked: 5000000n,
    totalDepositors: 3n,
    rewardRate: 100n,
    isPaused: false,
    currentBlock: 500n,
  };

  const validUserStats = {
    totalDeposited: 1000000n,
    totalWithdrawn: 0n,
    totalRewards: 500n,
    depositCount: 1n,
  };

  const validProposal = {
    proposer: 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09',
    title: 'Test',
    description: 'A test proposal',
    proposalType: 'general',
    value: 0n,
    startBlock: 100n,
    endBlock: 244n,
    votesFor: 10n,
    votesAgainst: 2n,
    totalVoters: 3n,
    executed: false,
    passed: false,
  };

  describe('isDepositRecord', () => {
    it('returns true for valid deposit records', () => {
      expect(isDepositRecord(validDeposit)).toBe(true);
    });
    it('returns false when fields are numbers instead of bigint', () => {
      expect(isDepositRecord({ ...validDeposit, amount: 100 })).toBe(false);
    });
    it('returns false for null', () => {
      expect(isDepositRecord(null)).toBe(false);
    });
  });

  describe('isVaultInfo', () => {
    it('returns true for valid vault info', () => {
      expect(isVaultInfo(validVaultInfo)).toBe(true);
    });
    it('returns false when isPaused is missing', () => {
      const { isPaused, ...rest } = validVaultInfo;
      expect(isVaultInfo(rest)).toBe(false);
    });
  });

  describe('isUserStats', () => {
    it('returns true for valid user stats', () => {
      expect(isUserStats(validUserStats)).toBe(true);
    });
    it('returns false for empty object', () => {
      expect(isUserStats({})).toBe(false);
    });
  });

  describe('isProposal', () => {
    it('returns true for a valid proposal', () => {
      expect(isProposal(validProposal)).toBe(true);
    });
    it('returns false when proposer is not a string', () => {
      expect(isProposal({ ...validProposal, proposer: 123 })).toBe(false);
    });
  });

  describe('isVoteRecord', () => {
    it('returns true for valid vote record', () => {
      expect(isVoteRecord({ amount: 5n, support: true })).toBe(true);
    });
    it('returns false when support is not boolean', () => {
      expect(isVoteRecord({ amount: 5n, support: 'yes' })).toBe(false);
    });
  });

  describe('isProposalResult', () => {
    it('returns true for valid result', () => {
      expect(isProposalResult({
        passed: true,
        votesFor: 10n,
        votesAgainst: 2n,
        totalVoters: 3n,
        executed: false,
        votingEnded: true,
      })).toBe(true);
    });
  });

  describe('isWithdrawResult', () => {
    it('returns true for valid withdraw result', () => {
      expect(isWithdrawResult({ stxReturned: 1000n, rewardsEarned: 50n })).toBe(true);
    });
    it('returns false when values are numbers', () => {
      expect(isWithdrawResult({ stxReturned: 1000, rewardsEarned: 50 })).toBe(false);
    });
  });

  describe('isContractNames', () => {
    it('returns true for valid contract names', () => {
      expect(isContractNames({
        vaultCore: 'vault-core-v4',
        governanceToken: 'governance-token',
        proposalVoting: 'proposal-voting',
      })).toBe(true);
    });
    it('returns false when a field is missing', () => {
      expect(isContractNames({
        vaultCore: 'vault-core-v4',
        governanceToken: 'governance-token',
      })).toBe(false);
    });
  });

  describe('isPOSVaultConfig', () => {
    it('returns true for empty config', () => {
      expect(isPOSVaultConfig({})).toBe(true);
    });
    it('returns true for valid partial config', () => {
      expect(isPOSVaultConfig({ network: 'testnet' })).toBe(true);
    });
    it('returns false for invalid network', () => {
      expect(isPOSVaultConfig({ network: 'devnet' })).toBe(false);
    });
    it('returns false for non-object', () => {
      expect(isPOSVaultConfig('config')).toBe(false);
    });
  });
});
