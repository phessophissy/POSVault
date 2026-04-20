import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** TransactionHistory module configuration */
export interface TransactionHistoryConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
