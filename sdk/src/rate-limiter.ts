import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** RateLimiter module configuration */
export interface RateLimiterConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default RateLimiter configuration */
export const DEFAULT_RATELIMITER_CONFIG: RateLimiterConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** RateLimiter data entry */
export interface RateLimiterEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new RateLimiter entry */
export function createRateLimiterEntry(
  id: string,
  value: bigint,
  label: string
): RateLimiterEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate RateLimiter entry */
export function validateRateLimiterEntry(entry: RateLimiterEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterRateLimiterByTimeRange(
  entries: RateLimiterEntry[],
  startTime: number,
  endTime: number
): RateLimiterEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate RateLimiter values */
export function aggregateRateLimiterValues(
  entries: RateLimiterEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate RateLimiter average */
export function calculateRateLimiterAverage(
  entries: RateLimiterEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateRateLimiterValues(entries));
  return total / entries.length;
}

/** Group RateLimiter entries by label */
export function groupRateLimiterByLabel(
  entries: RateLimiterEntry[]
): Map<string, RateLimiterEntry[]> {
  const groups = new Map<string, RateLimiterEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort RateLimiter entries by value descending */
export function sortRateLimiterByValue(
  entries: RateLimiterEntry[]
): RateLimiterEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N RateLimiter entries */
export function getTopRateLimiterEntries(
  entries: RateLimiterEntry[],
  n: number
): RateLimiterEntry[] {
  return sortRateLimiterByValue(entries).slice(0, n);
}

/** Calculate RateLimiter growth rate */
export function calculateRateLimiterGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}
