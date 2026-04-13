import type { CheckResult } from './health-types.js';

/**
 * Checks connectivity to the Stacks API by hitting the /v2/info endpoint.
 * Returns latency and block height.
 */
export async function checkApiConnectivity(
  apiBaseUrl: string,
  timeoutMs: number
): Promise<CheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBaseUrl}/v2/info`, {
      signal: controller.signal,
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      return {
        name: 'api-connectivity',
        status: 'unhealthy',
        latencyMs,
        message: `API returned HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as Record<string, unknown>;
    const blockHeight = data.stacks_tip_height ?? data.burn_block_height;

    return {
      name: 'api-connectivity',
      status: latencyMs > 3000 ? 'degraded' : 'healthy',
      latencyMs,
      message: latencyMs > 3000 ? 'API response is slow' : 'API is reachable',
      details: {
        blockHeight,
        networkId: data.network_id,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';

    return {
      name: 'api-connectivity',
      status: 'unhealthy',
      latencyMs,
      message: isTimeout
        ? `API request timed out after ${timeoutMs}ms`
        : `API unreachable: ${error instanceof Error ? error.message : String(error)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
