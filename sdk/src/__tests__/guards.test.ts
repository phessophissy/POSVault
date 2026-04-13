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
