import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** AddressBook module configuration */
export interface AddressBookConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}
