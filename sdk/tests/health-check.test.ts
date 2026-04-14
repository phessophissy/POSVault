import { describe, it, expect } from 'vitest';
import type {
  HealthReport,
  CheckResult,
  HealthStatus,
} from '../src/health-types.js';
import {
  formatHealthReport,
  healthSummary,
} from '../src/health-formatter.js';

describe('health-types', () => {
  it('HealthStatus type accepts valid values', () => {
    const statuses: HealthStatus[] = ['healthy', 'degraded', 'unhealthy'];
    expect(statuses).toHaveLength(3);
  });

  it('CheckResult can be constructed with minimal fields', () => {
    const check: CheckResult = {
      name: 'test-check',
      status: 'healthy',
      latencyMs: 42,
    };
    expect(check.name).toBe('test-check');
    expect(check.message).toBeUndefined();
    expect(check.details).toBeUndefined();
  });

  it('CheckResult supports optional message and details', () => {
    const check: CheckResult = {
      name: 'test-check',
      status: 'degraded',
      latencyMs: 100,
      message: 'Slow response',
      details: { endpoint: '/v2/info', retries: 2 },
    };
    expect(check.message).toBe('Slow response');
    expect(check.details?.endpoint).toBe('/v2/info');
  });
});

describe('health-formatter', () => {
  const sampleReport: HealthReport = {
    status: 'healthy',
    timestamp: '2025-01-15T12:00:00.000Z',
    network: 'mainnet',
    durationMs: 150,
    checks: [
      { name: 'api-connectivity', status: 'healthy', latencyMs: 80, message: 'API is reachable' },
      { name: 'contract-existence', status: 'healthy', latencyMs: 120, message: 'All 3 contracts deployed' },
    ],
  };

  it('formatHealthReport includes status header', () => {
    const output = formatHealthReport(sampleReport);
    expect(output).toContain('HEALTHY');
    expect(output).toContain('✓');
  });

  it('formatHealthReport includes network and timestamp', () => {
    const output = formatHealthReport(sampleReport);
    expect(output).toContain('mainnet');
    expect(output).toContain('2025-01-15T12:00:00.000Z');
  });

  it('formatHealthReport lists each check', () => {
    const output = formatHealthReport(sampleReport);
    expect(output).toContain('api-connectivity');
    expect(output).toContain('contract-existence');
  });

  it('formatHealthReport shows latency for each check', () => {
    const output = formatHealthReport(sampleReport);
    expect(output).toContain('80ms');
    expect(output).toContain('120ms');
  });

  it('formatHealthReport shows degraded icon for degraded status', () => {
    const degradedReport: HealthReport = {
      ...sampleReport,
      status: 'degraded',
      checks: [
        { name: 'api-connectivity', status: 'degraded', latencyMs: 4000, message: 'Slow' },
      ],
    };
    const output = formatHealthReport(degradedReport);
    expect(output).toContain('⚠');
    expect(output).toContain('DEGRADED');
  });

  it('formatHealthReport shows unhealthy icon', () => {
    const unhealthyReport: HealthReport = {
      ...sampleReport,
      status: 'unhealthy',
      checks: [
        { name: 'api-connectivity', status: 'unhealthy', latencyMs: 0, message: 'Connection refused' },
      ],
    };
    const output = formatHealthReport(unhealthyReport);
    expect(output).toContain('✗');
    expect(output).toContain('UNHEALTHY');
  });

  it('formatHealthReport handles details with arrays', () => {
    const report: HealthReport = {
      ...sampleReport,
      checks: [
        {
          name: 'contracts',
          status: 'healthy',
          latencyMs: 50,
          details: { contracts: [{ id: 'a' }, { id: 'b' }] },
        },
      ],
    };
    const output = formatHealthReport(report);
    expect(output).toContain('2 items');
  });

  it('healthSummary returns single-line format', () => {
    const summary = healthSummary(sampleReport);
    expect(summary).toContain('healthy');
    expect(summary).toContain('150ms');
    expect(summary).toContain('api-connectivity:healthy');
  });

  it('healthSummary includes all check names', () => {
    const summary = healthSummary(sampleReport);
    expect(summary).toContain('contract-existence:healthy');
  });
});
