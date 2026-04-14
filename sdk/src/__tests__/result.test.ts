import { describe, it, expect } from 'vitest';
import {
  isClarityOk,
  isClarityErr,
  unwrapResult,
  safeUnwrap,
} from '../result.js';

describe('result narrowing', () => {
  describe('isClarityOk', () => {
    it('returns true for ok results', () => {
      expect(isClarityOk({ type: 'ok', value: 42 })).toBe(true);
    });
    it('returns false for err results', () => {
      expect(isClarityOk({ type: 'err', value: 200 })).toBe(false);
    });
    it('returns false for non-objects', () => {
      expect(isClarityOk(null)).toBe(false);
      expect(isClarityOk('ok')).toBe(false);
    });
  });

  describe('isClarityErr', () => {
    it('returns true for err results', () => {
      expect(isClarityErr({ type: 'err', value: 200 })).toBe(true);
    });
    it('returns false for ok results', () => {
      expect(isClarityErr({ type: 'ok', value: 42 })).toBe(false);
    });
  });

  describe('unwrapResult', () => {
    it('returns inner value for ok', () => {
      expect(unwrapResult({ type: 'ok', value: { data: 'yes' } })).toEqual({
        data: 'yes',
      });
    });

    it('throws POSVaultError for err', () => {
      expect(() =>
        unwrapResult({ type: 'err', value: { type: 'uint', value: 200 } }),
      ).toThrow('Contract returned err');
    });

    it('includes context in error message', () => {
      expect(() =>
        unwrapResult(
          { type: 'err', value: 207 },
          'deposit',
        ),
      ).toThrow('in deposit');
    });

    it('returns non-response values as-is', () => {
      expect(unwrapResult(42)).toBe(42);
      expect(unwrapResult('hello')).toBe('hello');
    });
  });

  describe('safeUnwrap', () => {
    it('returns ok: true for ok results', () => {
      const result = safeUnwrap({ type: 'ok', value: 100 });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(100);
    });

    it('returns ok: false for err results', () => {
      const result = safeUnwrap({ type: 'err', value: 200 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe(200);
    });

    it('treats non-response values as ok', () => {
      const result = safeUnwrap('plain value');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe('plain value');
    });
  });
});
