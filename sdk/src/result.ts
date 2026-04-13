import { POSVaultError } from './errors.js';
import { isNonNullObject } from './guards.js';

// ---------------------------------------------------------------------------
// Clarity result narrowing
// ---------------------------------------------------------------------------

/**
 * Represents a Clarity `(ok ...)` or `(err ...)` value after cvToJSON.
 */
export interface ClarityOk<T = unknown> {
  type: 'ok';
  value: T;
}

export interface ClarityErr<E = unknown> {
  type: 'err';
  value: E;
}

export type ClarityResult<T = unknown, E = unknown> = ClarityOk<T> | ClarityErr<E>;

export function isClarityOk<T>(result: unknown): result is ClarityOk<T> {
  return isNonNullObject(result) && result.type === 'ok';
}

export function isClarityErr<E>(result: unknown): result is ClarityErr<E> {
  return isNonNullObject(result) && result.type === 'err';
}

/**
 * Unwrap a Clarity result — return the inner value if `(ok ...)`,
 * throw a `POSVaultError` if `(err ...)`.
 */
export function unwrapResult<T>(result: unknown, context?: string): T {
  if (isClarityOk<T>(result)) {
    return result.value;
  }
  if (isClarityErr(result)) {
    const code = typeof result.value === 'object' && result.value !== null
      ? (result.value as any).value
      : result.value;
    throw new POSVaultError(
      `Contract returned err${context ? ` in ${context}` : ''}: ${JSON.stringify(code)}`,
      typeof code === 'number' ? code : undefined,
    );
  }
  // Not a response wrapper — return as-is (plain value)
  return result as T;
}

/**
 * Safe version of `unwrapResult` that returns a discriminated union
 * instead of throwing.
 */
export function safeUnwrap<T, E = unknown>(
  result: unknown,
): { ok: true; value: T } | { ok: false; error: E } {
  if (isClarityOk<T>(result)) {
    return { ok: true, value: result.value };
  }
  if (isClarityErr<E>(result)) {
    return { ok: false, error: result.value };
  }
  // Treat non-response values as ok
  return { ok: true, value: result as T };
}
