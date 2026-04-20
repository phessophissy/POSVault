import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** Notifications module configuration */
export interface NotificationsConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default Notifications configuration */
export const DEFAULT_NOTIFICATIONS_CONFIG: NotificationsConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** Notifications data entry */
export interface NotificationsEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new Notifications entry */
export function createNotificationsEntry(
  id: string,
  value: bigint,
  label: string
): NotificationsEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate Notifications entry */
export function validateNotificationsEntry(entry: NotificationsEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}

/** Filter entries by time range */
export function filterNotificationsByTimeRange(
  entries: NotificationsEntry[],
  startTime: number,
  endTime: number
): NotificationsEntry[] {
  return entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
}

/** Aggregate Notifications values */
export function aggregateNotificationsValues(
  entries: NotificationsEntry[]
): bigint {
  return entries.reduce((sum, e) => sum + e.value, 0n);
}

/** Calculate Notifications average */
export function calculateNotificationsAverage(
  entries: NotificationsEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = Number(aggregateNotificationsValues(entries));
  return total / entries.length;
}

/** Group Notifications entries by label */
export function groupNotificationsByLabel(
  entries: NotificationsEntry[]
): Map<string, NotificationsEntry[]> {
  const groups = new Map<string, NotificationsEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.label) || [];
    list.push(entry);
    groups.set(entry.label, list);
  }
  return groups;
}

/** Sort Notifications entries by value descending */
export function sortNotificationsByValue(
  entries: NotificationsEntry[]
): NotificationsEntry[] {
  return [...entries].sort((a, b) => Number(b.value - a.value));
}

/** Get top N Notifications entries */
export function getTopNotificationsEntries(
  entries: NotificationsEntry[],
  n: number
): NotificationsEntry[] {
  return sortNotificationsByValue(entries).slice(0, n);
}
