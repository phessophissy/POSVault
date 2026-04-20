import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** Portfolio module configuration */
export interface PortfolioConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
