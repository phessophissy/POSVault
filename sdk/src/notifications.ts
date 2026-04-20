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
