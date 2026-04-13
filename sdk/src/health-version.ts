import type { CheckResult } from './health-types.js';
import { SDK_VERSION } from './version.js';

/**
 * Reports the current SDK version and validates the runtime
 * environment has the required dependencies available.
 */
export async function checkVersion(): Promise<CheckResult> {
  const start = Date.now();
  const issues: string[] = [];

  // Check for fetch availability (needed for API calls)
  if (typeof globalThis.fetch !== 'function') {
    issues.push('fetch is not available (Node 18+ or polyfill required)');
  }

  // Check for AbortController availability
  if (typeof globalThis.AbortController !== 'function') {
    issues.push('AbortController is not available');
  }

  // Check for BigInt support (needed for Clarity uint128 values)
  if (typeof BigInt !== 'function') {
    issues.push('BigInt is not supported in this environment');
  }

  const latencyMs = Date.now() - start;

  if (issues.length > 0) {
    return {
      name: 'sdk-version',
      status: 'degraded',
      latencyMs,
      message: `SDK v${SDK_VERSION} — ${issues.length} environment issue(s)`,
      details: { version: SDK_VERSION, issues },
    };
  }

  return {
    name: 'sdk-version',
    status: 'healthy',
    latencyMs,
    message: `SDK v${SDK_VERSION} — runtime OK`,
    details: {
      version: SDK_VERSION,
      runtime: typeof globalThis.window !== 'undefined' ? 'browser' : 'node',
    },
  };
}
