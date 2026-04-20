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
