import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";
import { TOKEN_DECIMALS } from "./constants.js";

/** AddressBook module configuration */
export interface AddressBookConfig {
  enabled: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/** Default AddressBook configuration */
export const DEFAULT_ADDRESSBOOK_CONFIG: AddressBookConfig = {
  enabled: true,
  cacheTimeout: 300000,
  maxRetries: 3,
};
