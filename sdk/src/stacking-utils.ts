import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** StackingUtils module configuration */
export interface StackingUtilsConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default StackingUtils configuration */
export const DEFAULT_STACKINGUTILS_CONFIG: StackingUtilsConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** StackingUtils data entry */
export interface StackingUtilsEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new StackingUtils entry */
export function createStackingUtilsEntry(
  id: string,
  value: bigint,
  label: string
): StackingUtilsEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate StackingUtils entry */
export function validateStackingUtilsEntry(entry: StackingUtilsEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterStackingUtilsByTimeRange(
  entries: StackingUtilsEntry[],
  startTime: number,
  endTime: number
): StackingUtilsEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate StackingUtils values */
export function aggregateStackingUtilsValues(
  entries: StackingUtilsEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate StackingUtils average */
export function calculateStackingUtilsAverage(
  entries: StackingUtilsEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateStackingUtilsValues(entries));
  return total / entries.length;
}

/** Group StackingUtils entries by label */
export function groupStackingUtilsByLabel(
  entries: StackingUtilsEntry[]
): Map<string, StackingUtilsEntry[]> {
  const groups = new Map<string, StackingUtilsEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort StackingUtils entries by value descending */
export function sortStackingUtilsByValue(
  entries: StackingUtilsEntry[]
): StackingUtilsEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N StackingUtils entries */
export function getTopStackingUtilsEntries(
  entries: StackingUtilsEntry[],
  n: number
): StackingUtilsEntry[] {
  return sortStackingUtilsByValue(entries).slice(0, n);
}

/** Calculate StackingUtils growth rate */
export function calculateStackingUtilsGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}

/** Format StackingUtils entry for display */
export function formatStackingUtilsEntry(
  entry: StackingUtilsEntry
): string {
  const date = new Date(entry.timestamp).toISOString();
  const val = Number(entry.value) / Math.pow(10, TOKEN_DECIMALS);
  return `[${date}] ${entry.label}: ${val.toFixed(6)}`;
}

/** Serialize StackingUtils entries to JSON */
export function serializeStackingUtilsEntries(
  entries: StackingUtilsEntry[]
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

/** Deserialize StackingUtils entries from JSON */
export function deserializeStackingUtilsEntries(
  json: string
): StackingUtilsEntry[] {
  const parsed = JSON.parse(json);
  return parsed.map((e: Record<string, unknown>) => ({
    ...e,
    value: BigInt(e.value as string),
  }));
}
