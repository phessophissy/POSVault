import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** TransactionHistory module configuration */
export interface TransactionHistoryConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default TransactionHistory configuration */
export const DEFAULT_TRANSACTIONHISTORY_CONFIG: TransactionHistoryConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** TransactionHistory data entry */
export interface TransactionHistoryEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new TransactionHistory entry */
export function createTransactionHistoryEntry(
  id: string,
  value: bigint,
  label: string
): TransactionHistoryEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate TransactionHistory entry */
export function validateTransactionHistoryEntry(entry: TransactionHistoryEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterTransactionHistoryByTimeRange(
  entries: TransactionHistoryEntry[],
  startTime: number,
  endTime: number
): TransactionHistoryEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate TransactionHistory values */
export function aggregateTransactionHistoryValues(
  entries: TransactionHistoryEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate TransactionHistory average */
export function calculateTransactionHistoryAverage(
  entries: TransactionHistoryEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateTransactionHistoryValues(entries));
  return total / entries.length;
}
