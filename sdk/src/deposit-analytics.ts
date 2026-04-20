import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** DepositAnalytics module configuration */
export interface DepositAnalyticsConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default DepositAnalytics configuration */
export const DEFAULT_DEPOSITANALYTICS_CONFIG: DepositAnalyticsConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** DepositAnalytics data entry */
export interface DepositAnalyticsEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new DepositAnalytics entry */
export function createDepositAnalyticsEntry(
  id: string,
  value: bigint,
  label: string
): DepositAnalyticsEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate DepositAnalytics entry */
export function validateDepositAnalyticsEntry(entry: DepositAnalyticsEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterDepositAnalyticsByTimeRange(
  entries: DepositAnalyticsEntry[],
  startTime: number,
  endTime: number
): DepositAnalyticsEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate DepositAnalytics values */
export function aggregateDepositAnalyticsValues(
  entries: DepositAnalyticsEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate DepositAnalytics average */
export function calculateDepositAnalyticsAverage(
  entries: DepositAnalyticsEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateDepositAnalyticsValues(entries));
  return total / entries.length;
}

/** Group DepositAnalytics entries by label */
export function groupDepositAnalyticsByLabel(
  entries: DepositAnalyticsEntry[]
): Map<string, DepositAnalyticsEntry[]> {
  const groups = new Map<string, DepositAnalyticsEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort DepositAnalytics entries by value descending */
export function sortDepositAnalyticsByValue(
  entries: DepositAnalyticsEntry[]
): DepositAnalyticsEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N DepositAnalytics entries */
export function getTopDepositAnalyticsEntries(
  entries: DepositAnalyticsEntry[],
  n: number
): DepositAnalyticsEntry[] {
  return sortDepositAnalyticsByValue(entries).slice(0, n);
}

/** Calculate DepositAnalytics growth rate */
export function calculateDepositAnalyticsGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}

/** Format DepositAnalytics entry for display */
export function formatDepositAnalyticsEntry(
  entry: DepositAnalyticsEntry
): string {
  const date = new Date(entry.timestamp).toISOString();
  const val = Number(entry.value) / Math.pow(10, TOKEN_DECIMALS);
  return `[${date}] ${entry.label}: ${val.toFixed(6)}`;
}

/** Serialize DepositAnalytics entries to JSON */
export function serializeDepositAnalyticsEntries(
  entries: DepositAnalyticsEntry[]
): string {
  return JSON.stringify(
    entries.map(e => ({
      ...e,
      value: e.value.toString(),
    })),
    null,
    2
  );
}

/** Deserialize DepositAnalytics entries from JSON */
export function deserializeDepositAnalyticsEntries(
  json: string
): DepositAnalyticsEntry[] {
  const parsed = JSON.parse(json);
  return parsed.map((e: Record<string, unknown>) => ({
    ...e,
    value: BigInt(e.value as string),
  }));
}
