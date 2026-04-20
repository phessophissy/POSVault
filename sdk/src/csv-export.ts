import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** CsvExport module configuration */
export interface CsvExportConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default CsvExport configuration */
export const DEFAULT_CSVEXPORT_CONFIG: CsvExportConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};
