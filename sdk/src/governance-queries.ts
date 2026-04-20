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

/** Calculate vote participation rate */
export function voteParticipation(
  totalVoters: bigint,
  eligibleVoters: bigint
): number {
  if (eligibleVoters === 0n) return 0;
  return Number((totalVoters * 10000n) / eligibleVoters) / 100;
}

/** Check if proposal has reached quorum */
export function hasQuorum(
  totalVoters: bigint,
  eligibleVoters: bigint,
  quorumPercent: number = 10
): boolean {
  const participation = voteParticipation(totalVoters, eligibleVoters);
  return participation >= quorumPercent;
}

/** Format proposal end block as estimated date */
export function estimateProposalEndDate(
  currentBlock: bigint,
  endBlock: bigint,
  avgBlockTimeSeconds: number = 600
): Date {
  const blocksRemaining = Number(endBlock - currentBlock);
  const secondsRemaining = blocksRemaining * avgBlockTimeSeconds;
  return new Date(Date.now() + secondsRemaining * 1000);
}

/** Get vote power ratio */
export function votePowerRatio(
  votesFor: bigint,
  votesAgainst: bigint
): { forPercent: number; againstPercent: number } {
  const total = votesFor + votesAgainst;
  if (total === 0n) return { forPercent: 0, againstPercent: 0 };
  return {
    forPercent: Number((votesFor * 10000n) / total) / 100,
    againstPercent: Number((votesAgainst * 10000n) / total) / 100,
  };
}

/** Determine if a vote would change the outcome */
export function isDecisiveVote(
  currentFor: bigint,
  currentAgainst: bigint,
  voteAmount: bigint,
  voteDirection: "for" | "against"
): boolean {
  if (voteDirection === "for") {
    return currentFor <= currentAgainst && currentFor + voteAmount > currentAgainst;
  }
  return currentAgainst <= currentFor && currentAgainst + voteAmount > currentFor;
}

/** Calculate voting deadline in human-readable format */
export function formatVotingDeadline(
  blocksRemaining: bigint
): string {
  const hours = Number(blocksRemaining) / 6;
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = hours / 24;
  if (days < 7) return `${Math.round(days)} days`;
  return `${Math.round(days / 7)} weeks`;
}

/** Summary of a proposal for display */
export interface ProposalSummary {
  id: number;
  title: string;
  status: ProposalStatus;
  forPercent: number;
  againstPercent: number;
  participation: number;
  deadline: string;
}

/** Build proposal summary from raw data */
export function buildProposalSummary(
  id: number,
  title: string,
  startBlock: bigint,
  endBlock: bigint,
  currentBlock: bigint,
  votesFor: bigint,
  votesAgainst: bigint,
  totalVoters: bigint,
  eligibleVoters: bigint
): ProposalSummary {
  const status = getProposalStatus(startBlock, endBlock, currentBlock, votesFor, votesAgainst);
  const { forPercent, againstPercent } = votePowerRatio(votesFor, votesAgainst);
  const participation = voteParticipation(totalVoters, eligibleVoters);
  const blocksLeft = endBlock > currentBlock ? endBlock - currentBlock : 0n;
  const deadline = formatVotingDeadline(blocksLeft);
  return { id, title, status, forPercent, againstPercent, participation, deadline };
}

/** Filter proposals by status */
export function filterProposals(
  proposals: ProposalSummary[],
  status: ProposalStatus
): ProposalSummary[] {
  return proposals.filter(p => p.status === status);
}
