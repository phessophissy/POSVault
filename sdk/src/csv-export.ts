import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** CsvExport module configuration */
export interface CsvExportConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default CsvExport configuration */
export const DEFAULT_CSVEXPORT_CONFIG: CsvExportConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** CsvExport data entry */
export interface CsvExportEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new CsvExport entry */
export function createCsvExportEntry(
  id: string,
  value: bigint,
  label: string
): CsvExportEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate CsvExport entry */
export function validateCsvExportEntry(entry: CsvExportEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterCsvExportByTimeRange(
  entries: CsvExportEntry[],
  startTime: number,
  endTime: number
): CsvExportEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate CsvExport values */
export function aggregateCsvExportValues(
  entries: CsvExportEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate CsvExport average */
export function calculateCsvExportAverage(
  entries: CsvExportEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateCsvExportValues(entries));
  return total / entries.length;
}

/** Group CsvExport entries by label */
export function groupCsvExportByLabel(
  entries: CsvExportEntry[]
): Map<string, CsvExportEntry[]> {
  const groups = new Map<string, CsvExportEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort CsvExport entries by value descending */
export function sortCsvExportByValue(
  entries: CsvExportEntry[]
): CsvExportEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N CsvExport entries */
export function getTopCsvExportEntries(
  entries: CsvExportEntry[],
  n: number
): CsvExportEntry[] {
  return sortCsvExportByValue(entries).slice(0, n);
}

/** Calculate CsvExport growth rate */
export function calculateCsvExportGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}

/** Format CsvExport entry for display */
export function formatCsvExportEntry(
  entry: CsvExportEntry
): string {
  const date = new Date(entry.timestamp).toISOString();
  const val = Number(entry.value) / Math.pow(10, TOKEN_DECIMALS);
  return `[${date}] ${entry.label}: ${val.toFixed(6)}`;
}
