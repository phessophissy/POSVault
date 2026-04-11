import { Cl } from "@stacks/transactions";

export const DEPLOYER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const USER1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
export const USER2 = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
export const USER3 = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC";

export const CONTRACTS = {
  vaultCore: "vault-core-v4",
  governanceToken: "governance-token",
  proposalVoting: "proposal-voting",
} as const;

export const DEPOSIT_1_STX = 1_000_000;
export const DEPOSIT_5_STX = 5_000_000;
export const DEPOSIT_10_STX = 10_000_000;
export const BLOCKS_PER_CYCLE = 144;

export function depositAs(user: string, amount: number) {
  return simnet.callPublicFn(CONTRACTS.vaultCore, "deposit", [Cl.uint(amount)], user);
}

export function withdrawAs(user: string) {
  return simnet.callPublicFn(CONTRACTS.vaultCore, "withdraw", [], user);
}

export function claimAs(user: string) {
  return simnet.callPublicFn(CONTRACTS.vaultCore, "claim-rewards", [], user);
}

export function getVaultInfo() {
  return simnet.callReadOnlyFn(CONTRACTS.vaultCore, "get-vault-info", [], DEPLOYER);
}

export function getDeposit(user: string) {
  return simnet.callReadOnlyFn(CONTRACTS.vaultCore, "get-deposit", [Cl.principal(user)], DEPLOYER);
}

export function getPendingRewards(user: string) {
  return simnet.callReadOnlyFn(CONTRACTS.vaultCore, "get-pending-rewards", [Cl.principal(user)], DEPLOYER);
}

export function getUserStats(user: string) {
  return simnet.callReadOnlyFn(CONTRACTS.vaultCore, "get-user-stats", [Cl.principal(user)], DEPLOYER);
}
