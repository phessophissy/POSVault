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

/** Portfolio data entry */
export interface PortfolioEntry {
  id: string;
  timestamp: number;
  value: bigint;
  label: string;
  metadata: Record<string, unknown>;
}

/** Create a new Portfolio entry */
export function createPortfolioEntry(
  id: string,
  value: bigint,
  label: string
): PortfolioEntry {
  return {
    id,
    timestamp: Date.now(),
    value,
    label,
    metadata: {},
  };
}

/** Validate Portfolio entry */
export function validatePortfolioEntry(entry: PortfolioEntry): boolean {
  if (!entry.id || entry.id.length === 0) return false;
  if (entry.value < 0n) return false;
  if (entry.timestamp <= 0) return false;
  return true;
}
