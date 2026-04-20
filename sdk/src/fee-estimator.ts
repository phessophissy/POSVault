import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** FeeEstimator module configuration */
export interface FeeEstimatorConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default FeeEstimator configuration */
export const DEFAULT_FEEESTIMATOR_CONFIG: FeeEstimatorConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};
