import type { HealthReport, CheckResult } from './health-types.js';

const STATUS_ICONS: Record<string, string> = {
  healthy: '✓',
  degraded: '⚠',
  unhealthy: '✗',
};

/**
 * Formats a HealthReport into a human-readable string suitable
 * for console output or logging.
 */
export function formatHealthReport(report: HealthReport): string {
  const lines: string[] = [];

  const icon = STATUS_ICONS[report.status] ?? '?';
  lines.push(`${icon} POSVault Health: ${report.status.toUpperCase()}`);
  lines.push(`  Network: ${report.network}`);
  lines.push(`  Timestamp: ${report.timestamp}`);
  lines.push(`  Total Duration: ${report.durationMs}ms`);
  lines.push('');

  for (const check of report.checks) {
    lines.push(formatCheck(check));
  }

  return lines.join('\n');
}

function formatCheck(check: CheckResult): string {
  const icon = STATUS_ICONS[check.status] ?? '?';
  const parts = [
    `  ${icon} ${check.name} (${check.latencyMs}ms)`,
  ];

  if (check.message) {
    parts.push(`    ${check.message}`);
  }

  if (check.details) {
    for (const [key, value] of Object.entries(check.details)) {
      if (Array.isArray(value)) {
        parts.push(`    ${key}: [${value.length} items]`);
      } else if (typeof value === 'object' && value !== null) {
        parts.push(`    ${key}: ${JSON.stringify(value)}`);
      } else {
        parts.push(`    ${key}: ${String(value)}`);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Returns a one-line summary of the health report.
 */
export function healthSummary(report: HealthReport): string {
  const icon = STATUS_ICONS[report.status] ?? '?';
  const checkSummary = report.checks
    .map((c) => `${c.name}:${c.status}`)
    .join(', ');
  return `${icon} ${report.status} (${report.durationMs}ms) [${checkSummary}]`;
}
