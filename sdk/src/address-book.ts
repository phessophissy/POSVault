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
