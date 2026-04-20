import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** DepositAnalytics module configuration */
export interface DepositAnalyticsConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
