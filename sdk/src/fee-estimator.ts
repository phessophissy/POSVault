import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** FeeEstimator module configuration */
export interface FeeEstimatorConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default FeeEstimator configuration */
export const DEFAULT_FEEESTIMATOR_CONFIG: FeeEstimatorConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** FeeEstimator data entry */
export interface FeeEstimatorEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new FeeEstimator entry */
export function createFeeEstimatorEntry(
  id: string,
  value: bigint,
  label: string
): FeeEstimatorEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate FeeEstimator entry */
export function validateFeeEstimatorEntry(entry: FeeEstimatorEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterFeeEstimatorByTimeRange(
  entries: FeeEstimatorEntry[],
  startTime: number,
  endTime: number
): FeeEstimatorEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate FeeEstimator values */
export function aggregateFeeEstimatorValues(
  entries: FeeEstimatorEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate FeeEstimator average */
export function calculateFeeEstimatorAverage(
  entries: FeeEstimatorEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateFeeEstimatorValues(entries));
  return total / entries.length;
}

/** Group FeeEstimator entries by label */
export function groupFeeEstimatorByLabel(
  entries: FeeEstimatorEntry[]
): Map<string, FeeEstimatorEntry[]> {
  const groups = new Map<string, FeeEstimatorEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort FeeEstimator entries by value descending */
export function sortFeeEstimatorByValue(
  entries: FeeEstimatorEntry[]
): FeeEstimatorEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N FeeEstimator entries */
export function getTopFeeEstimatorEntries(
  entries: FeeEstimatorEntry[],
  n: number
): FeeEstimatorEntry[] {
  return sortFeeEstimatorByValue(entries).slice(0, n);
}

/** Calculate FeeEstimator growth rate */
export function calculateFeeEstimatorGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}

/** Format FeeEstimator entry for display */
export function formatFeeEstimatorEntry(
  entry: FeeEstimatorEntry
): string {
  const date = new Date(entry.timestamp).toISOString();
  const val = Number(entry.value) / Math.pow(10, TOKEN_DECIMALS);
  return `[${date}] ${entry.label}: ${val.toFixed(6)}`;
}

/** Serialize FeeEstimator entries to JSON */
export function serializeFeeEstimatorEntries(
  entries: FeeEstimatorEntry[]
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

/** Deserialize FeeEstimator entries from JSON */
export function deserializeFeeEstimatorEntries(
  json: string
): FeeEstimatorEntry[] {
  const parsed = JSON.parse(json);
  return parsed.map((e: Record<string, unknown>) => ({
    ...e,
    value: BigInt(e.value as string),
  }));
}
