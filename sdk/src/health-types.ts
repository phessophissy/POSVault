/**
 * Types for the SDK health check & diagnostics module.
 */

/** Overall health status */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/** Individual check result */
export interface CheckResult {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  message?: string;
  details?: Record<string, unknown>;
}

/** Aggregated health report */
export interface HealthReport {
  status: HealthStatus;
  timestamp: string;
  network: 'mainnet' | 'testnet';
  checks: CheckResult[];
  durationMs: number;
}

/** Configuration for health check behavior */
export interface HealthCheckOptions {
  /** Request timeout in ms (default: 5000) */
  timeoutMs?: number;
  /** Which checks to run (default: all) */
  checks?: Array<'api' | 'contracts' | 'network' | 'version'>;
  /** Custom API base URL override */
  apiBaseUrl?: string;
}

/** Contract existence check detail */
export interface ContractInfo {
  contractId: string;
  exists: boolean;
  error?: string;
}
