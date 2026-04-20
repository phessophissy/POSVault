import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";

/** Governance query configuration */
export interface GovernanceQueryConfig {
  deployer: string;
  contractName: string;
  network: "mainnet" | "testnet";
}

/** Default governance query config */
export const DEFAULT_GOV_CONFIG: GovernanceQueryConfig = {
  deployer: DEPLOYER,
  contractName: CONTRACT_NAMES.proposalVoting,
  network: "mainnet",
};
