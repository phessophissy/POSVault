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
