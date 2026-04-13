import type { CheckResult } from './health-types.js';

/**
 * Checks the Stacks network status by verifying the mempool
 * endpoint is responsive and returning transaction counts.
 */
export async function checkNetworkStatus(
  apiBaseUrl: string,
  timeoutMs: number
): Promise<CheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `${apiBaseUrl}/extended/v1/tx/mempool?limit=1`,
      { signal: controller.signal }
    );

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        name: 'network-status',
        status: 'degraded',
        latencyMs,
        message: `Mempool endpoint returned HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      total?: number;
      results?: unknown[];
    };

    const mempoolSize = data.total ?? 0;

    return {
      name: 'network-status',
      status: 'healthy',
      latencyMs,
      message: `Network operational, ${mempoolSize} pending transactions`,
      details: {
        mempoolSize,
        mempoolEndpointLatencyMs: latencyMs,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';

    return {
      name: 'network-status',
      status: isTimeout ? 'degraded' : 'unhealthy',
      latencyMs,
      message: isTimeout
        ? `Network check timed out after ${timeoutMs}ms`
        : `Network check failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
