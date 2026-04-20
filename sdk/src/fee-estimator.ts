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
