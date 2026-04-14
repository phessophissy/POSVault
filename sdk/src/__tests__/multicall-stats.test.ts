import { describe, it, expect } from 'vitest';

// Test multicall stats logic (no network needed)

interface MockResult {
  error: string | null;
  durationMs: number;
}

function getMulticallStats(results: MockResult[]) {
  const succeeded = results.filter((r) => r.error === null).length;
  const durations = results.map((r) => r.durationMs);
  const totalDurationMs = durations.reduce((a, b) => a + b, 0);
  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    totalDurationMs,
    avgDurationMs: results.length > 0 ? Math.round(totalDurationMs / results.length) : 0,
    maxDurationMs: durations.length > 0 ? Math.max(...durations) : 0,
  };
}

describe('getMulticallStats', () => {
  it('computes stats for all-success results', () => {
    const results: MockResult[] = [
      { error: null, durationMs: 100 },
      { error: null, durationMs: 200 },
      { error: null, durationMs: 150 },
    ];
    const stats = getMulticallStats(results);
    expect(stats.total).toBe(3);
    expect(stats.succeeded).toBe(3);
    expect(stats.failed).toBe(0);
    expect(stats.totalDurationMs).toBe(450);
    expect(stats.avgDurationMs).toBe(150);
    expect(stats.maxDurationMs).toBe(200);
  });

  it('computes stats with some failures', () => {
    const results: MockResult[] = [
      { error: null, durationMs: 100 },
      { error: 'timeout', durationMs: 5000 },
      { error: null, durationMs: 200 },
    ];
    const stats = getMulticallStats(results);
    expect(stats.succeeded).toBe(2);
    expect(stats.failed).toBe(1);
  });

  it('handles empty array', () => {
    const stats = getMulticallStats([]);
    expect(stats.total).toBe(0);
    expect(stats.avgDurationMs).toBe(0);
    expect(stats.maxDurationMs).toBe(0);
  });
});
