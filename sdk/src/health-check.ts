import type {
  HealthReport,
  HealthCheckOptions,
  CheckResult,
  HealthStatus,
} from './health-types.js';
import type { POSVaultConfig } from './types.js';
import { resolveConfig } from './config.js';
import { checkApiConnectivity } from './health-api.js';
import { checkContracts } from './health-contracts.js';
import { checkNetworkStatus } from './health-network.js';
import { checkVersion } from './health-version.js';

const DEFAULT_TIMEOUT_MS = 5000;
const ALL_CHECKS = ['api', 'contracts', 'network', 'version'] as const;

/**
 * Runs a comprehensive health check against the POSVault
 * infrastructure and returns an aggregated report.
 *
 * @example
 * ```ts
 * const report = await runHealthCheck({ network: 'mainnet' });
 * console.log(report.status); // 'healthy' | 'degraded' | 'unhealthy'
 * ```
 */
export async function runHealthCheck(
  config?: POSVaultConfig,
  options?: HealthCheckOptions
): Promise<HealthReport> {
  const start = Date.now();
  const resolved = resolveConfig(config);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const apiBaseUrl = options?.apiBaseUrl ?? resolved.apiBaseUrl;
  const enabledChecks = options?.checks ?? [...ALL_CHECKS];

  const checks: CheckResult[] = [];

  // Run enabled checks concurrently
  const tasks: Promise<CheckResult>[] = [];

  if (enabledChecks.includes('version')) {
    tasks.push(checkVersion());
  }
  if (enabledChecks.includes('api')) {
    tasks.push(checkApiConnectivity(apiBaseUrl, timeoutMs));
  }
  if (enabledChecks.includes('network')) {
    tasks.push(checkNetworkStatus(apiBaseUrl, timeoutMs));
  }
  if (enabledChecks.includes('contracts')) {
    tasks.push(
      checkContracts(apiBaseUrl, resolved.deployer, resolved.contractNames, timeoutMs)
    );
  }

  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      checks.push(result.value);
    } else {
      checks.push({
        name: 'unknown',
        status: 'unhealthy',
        latencyMs: 0,
        message: `Check threw: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      });
    }
  }

  // Aggregate overall status: worst status wins
  const overallStatus = aggregateStatus(checks);

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    network: resolved.network,
    checks,
    durationMs: Date.now() - start,
  };
}

function aggregateStatus(checks: CheckResult[]): HealthStatus {
  if (checks.some((c) => c.status === 'unhealthy')) return 'unhealthy';
  if (checks.some((c) => c.status === 'degraded')) return 'degraded';
  return 'healthy';
}
