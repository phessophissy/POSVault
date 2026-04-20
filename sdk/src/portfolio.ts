import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** Portfolio module configuration */
export interface PortfolioConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default Portfolio configuration */
export const DEFAULT_PORTFOLIO_CONFIG: PortfolioConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** Portfolio data entry */
export interface PortfolioEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new Portfolio entry */
export function createPortfolioEntry(
  id: string,
  value: bigint,
  label: string
): PortfolioEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate Portfolio entry */
export function validatePortfolioEntry(entry: PortfolioEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterPortfolioByTimeRange(
  entries: PortfolioEntry[],
  startTime: number,
  endTime: number
): PortfolioEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate Portfolio values */
export function aggregatePortfolioValues(
  entries: PortfolioEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate Portfolio average */
export function calculatePortfolioAverage(
  entries: PortfolioEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregatePortfolioValues(entries));
  return total / entries.length;
}

/** Group Portfolio entries by label */
export function groupPortfolioByLabel(
  entries: PortfolioEntry[]
): Map<string, PortfolioEntry[]> {
  const groups = new Map<string, PortfolioEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort Portfolio entries by value descending */
export function sortPortfolioByValue(
  entries: PortfolioEntry[]
): PortfolioEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N Portfolio entries */
export function getTopPortfolioEntries(
  entries: PortfolioEntry[],
  n: number
): PortfolioEntry[] {
  return sortPortfolioByValue(entries).slice(0, n);
}

/** Calculate Portfolio growth rate */
export function calculatePortfolioGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}

/** Format Portfolio entry for display */
export function formatPortfolioEntry(
  entry: PortfolioEntry
): string {
  const date = new Date(entry.timestamp).toISOString();
  const val = Number(entry.value) / Math.pow(10, TOKEN_DECIMALS);
  return `[${date}] ${entry.label}: ${val.toFixed(6)}`;
}

/** Serialize Portfolio entries to JSON */
export function serializePortfolioEntries(
  entries: PortfolioEntry[]
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

/** Deserialize Portfolio entries from JSON */
export function deserializePortfolioEntries(
  json: string
): PortfolioEntry[] {
  const parsed = JSON.parse(json);
  return parsed.map((e: Record<string, unknown>) => ({
    ...e,
    value: BigInt(e.value as string),
  }));
}
