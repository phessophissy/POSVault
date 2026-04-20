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
