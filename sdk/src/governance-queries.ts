import { DEPLOYER, CONTRACT_NAMES } from "./constants.js";

/** Governance query configuration */
export interface GovernanceQueryConfig {
  deployer: string;
  contractName: string;
  network: "mainnet" | "testnet";
}
