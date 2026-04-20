import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** TransactionHistory module configuration */
export interface TransactionHistoryConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default TransactionHistory configuration */
export const DEFAULT_TRANSACTIONHISTORY_CONFIG: TransactionHistoryConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};

/** TransactionHistory data entry */
export interface TransactionHistoryEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}
