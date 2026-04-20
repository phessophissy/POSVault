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
