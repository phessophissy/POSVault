import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** AddressBook module configuration */
export interface AddressBookConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default AddressBook configuration */
export const DEFAULT_ADDRESSBOOK_CONFIG: AddressBookConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** AddressBook data entry */
export interface AddressBookEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new AddressBook entry */
export function createAddressBookEntry(
  id: string,
  value: bigint,
  label: string
): AddressBookEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate AddressBook entry */
export function validateAddressBookEntry(entry: AddressBookEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterAddressBookByTimeRange(
  entries: AddressBookEntry[],
  startTime: number,
  endTime: number
): AddressBookEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate AddressBook values */
export function aggregateAddressBookValues(
  entries: AddressBookEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate AddressBook average */
export function calculateAddressBookAverage(
  entries: AddressBookEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateAddressBookValues(entries));
  return total / entries.length;
}

/** Group AddressBook entries by label */
export function groupAddressBookByLabel(
  entries: AddressBookEntry[]
): Map<string, AddressBookEntry[]> {
  const groups = new Map<string, AddressBookEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort AddressBook entries by value descending */
export function sortAddressBookByValue(
  entries: AddressBookEntry[]
): AddressBookEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N AddressBook entries */
export function getTopAddressBookEntries(
  entries: AddressBookEntry[],
  n: number
): AddressBookEntry[] {
  return sortAddressBookByValue(entries).slice(0, n);
}

/** Calculate AddressBook growth rate */
export function calculateAddressBookGrowthRate(
  previousValue: bigint,
  currentValue: bigint
): number {
  if (previousValue === 0n) return currentValue > 0n ? 100 : 0;
  return Number(((currentValue - previousValue) * 10000n) / previousValue) / 100;
}

/** Format AddressBook entry for display */
export function formatAddressBookEntry(
  entry: AddressBookEntry
): string {
  const date = new Date(entry.timestamp).toISOString();
  const val = Number(entry.value) / Math.pow(10, TOKEN_DECIMALS);
  return `[${date}] ${entry.label}: ${val.toFixed(6)}`;
}

/** Serialize AddressBook entries to JSON */
export function serializeAddressBookEntries(
  entries: AddressBookEntry[]
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

/** Deserialize AddressBook entries from JSON */
export function deserializeAddressBookEntries(
  json: string
): AddressBookEntry[] {
  const parsed = JSON.parse(json);
  return parsed.map((e: Record<string, unknown>) => ({
    ...e,
    value: BigInt(e.value as string),
  }));
}
