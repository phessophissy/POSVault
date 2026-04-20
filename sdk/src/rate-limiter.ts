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

/** RateLimiter data entry */
export interface RateLimiterEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new RateLimiter entry */
export function createRateLimiterEntry(
  id: string,
  value: bigint,
  label: string
): RateLimiterEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}
