import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** Portfolio module configuration */
export interface PortfolioConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default Portfolio configuration */
export const DEFAULT_PORTFOLIO_CONFIG: PortfolioConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};
