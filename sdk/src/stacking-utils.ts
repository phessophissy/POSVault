import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** StackingUtils module configuration */
export interface StackingUtilsConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
