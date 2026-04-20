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
