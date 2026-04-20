import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** Notifications module configuration */
export interface NotificationsConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
