import { NetworkError } from './errors.js';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULT_RETRY: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = delay * 0.2 * Math.random();
  return Math.min(delay + jitter, maxDelay);
}

function isRetryable(error: unknown): boolean {
  if (error instanceof NetworkError) {
    const code = error.statusCode;
    return code === 429 || code === 500 || code === 502 || code === 503 || code === 504;
  }
  if (error instanceof Error) {
    return error.message.includes('ECONNRESET') ||
           error.message.includes('ETIMEDOUT') ||
           error.message.includes('fetch failed');
  }
  return false;
}

export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const opts = { ...DEFAULT_RETRY, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === opts.maxAttempts) {
        throw error;
      }
      const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
      await sleep(delay);
    }
  }

  throw lastError;
}
