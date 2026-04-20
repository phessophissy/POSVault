import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** RateLimiter module configuration */
export interface RateLimiterConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
