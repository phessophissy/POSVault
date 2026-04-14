import type { POSVaultConfig } from './types.js';
import type { HealthReport, HealthCheckOptions } from './health-types.js';
import { runHealthCheck } from './health-check.js';

export interface HealthMonitorOptions extends HealthCheckOptions {
  /** Polling interval in ms (default: 60000 = 1 minute) */
  intervalMs?: number;
  /** Callback invoked after each health check */
  onReport?: (report: HealthReport) => void;
  /** Callback invoked when status changes */
  onStatusChange?: (
    newStatus: HealthReport['status'],
    previousStatus: HealthReport['status'] | null,
    report: HealthReport
  ) => void;
}

export interface HealthMonitor {
  /** Start periodic health checking */
  start(): void;
  /** Stop periodic health checking */
  stop(): void;
  /** Run a single check immediately */
  checkNow(): Promise<HealthReport>;
  /** Get the last report (if any) */
  lastReport: HealthReport | null;
}

/**
 * Creates a periodic health monitor that runs health checks
 * on an interval and notifies listeners of status changes.
 */
export function createHealthMonitor(
  config?: POSVaultConfig,
  options?: HealthMonitorOptions
): HealthMonitor {
  const intervalMs = options?.intervalMs ?? 60_000;
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastReport: HealthReport | null = null;
  let previousStatus: HealthReport['status'] | null = null;

  async function runCheck(): Promise<HealthReport> {
    const report = await runHealthCheck(config, options);

    if (options?.onReport) {
      options.onReport(report);
    }

    if (report.status !== previousStatus && options?.onStatusChange) {
      options.onStatusChange(report.status, previousStatus, report);
    }

    previousStatus = report.status;
    lastReport = report;
    return report;
  }

  return {
    start() {
      if (timer !== null) return; // Already running
      // Run immediately, then on interval
      runCheck().catch(() => {});
      timer = setInterval(() => {
        runCheck().catch(() => {});
      }, intervalMs);
    },

    stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },

    checkNow: runCheck,

    get lastReport() {
      return lastReport;
    },
  };
}
