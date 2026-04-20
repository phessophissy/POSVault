import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** RateLimiter module configuration */
export interface RateLimiterConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default RateLimiter configuration */
export const DEFAULT_RATELIMITER_CONFIG: RateLimiterConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};
