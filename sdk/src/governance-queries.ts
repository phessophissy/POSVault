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

/** Proposal status enum */
export enum ProposalStatus {
  Pending = "pending",
  Active = "active",
  Passed = "passed",
  Rejected = "rejected",
  Executed = "executed",
}

/** Get proposal status from on-chain data */
export function getProposalStatus(
  startBlock: bigint,
  endBlock: bigint,
  currentBlock: bigint,
  votesFor: bigint,
  votesAgainst: bigint
): ProposalStatus {
  if (currentBlock < startBlock) return ProposalStatus.Pending;
  if (currentBlock <= endBlock) return ProposalStatus.Active;
  return votesFor > votesAgainst ? ProposalStatus.Passed : ProposalStatus.Rejected;
}
