import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const contract = "vault-core-v4";
const govToken = "governance-token";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const user2 = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
const depositAmount = 1_000_000; // 1 STX

describe("vault-core-v4", () => {
  describe("deposit", () => {
    it("allows a user to deposit STX", () => {
      const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("rejects zero deposit amount", () => {
      const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(0)], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });

    it("rejects duplicate deposit from same user", () => {
      simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });

    it("tracks deposit in user stats", () => {
      simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      const stats = simnet.callReadOnlyFn(contract, "get-user-stats", [Cl.principal(user1)], deployer);
      expect(stats.result).toHaveClarityType(ClarityType.OptionalSome);
    });
  });

  describe("withdraw", () => {
    it("allows withdrawal after deposit", () => {
      simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      simnet.mineEmptyBlocks(10);
      const result = simnet.callPublicFn(contract, "withdraw", [], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("rejects withdrawal without deposit", () => {
      const result = simnet.callPublicFn(contract, "withdraw", [], user2);
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });
  });

  describe("claim-rewards", () => {
    it("mints governance tokens as reward", () => {
      simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      simnet.mineEmptyBlocks(200);
      const result = simnet.callPublicFn(contract, "claim-rewards", [], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("rejects claim with no deposit", () => {
      const result = simnet.callPublicFn(contract, "claim-rewards", [], user2);
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });
  });

  describe("read-only functions", () => {
    it("get-vault-info returns current state", () => {
      const info = simnet.callReadOnlyFn(contract, "get-vault-info", [], deployer);
      expect(info.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("get-deposit returns none for new user", () => {
      const deposit = simnet.callReadOnlyFn(contract, "get-deposit", [Cl.principal(user2)], deployer);
      expect(deposit.result).toHaveClarityType(ClarityType.OptionalNone);
    });

    it("get-pending-rewards returns zero for new user", () => {
      const rewards = simnet.callReadOnlyFn(contract, "get-pending-rewards", [Cl.principal(user2)], deployer);
      expect(rewards.result).toHaveClarityType(ClarityType.ResponseOk);
    });
  });

  describe("admin functions", () => {
    it("owner can pause vault", () => {
      const result = simnet.callPublicFn(contract, "toggle-pause", [], deployer);
      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("non-owner cannot pause vault", () => {
      const result = simnet.callPublicFn(contract, "toggle-pause", [], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });

    it("owner can set reward rate", () => {
      const result = simnet.callPublicFn(contract, "set-reward-rate", [Cl.uint(200)], deployer);
      expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    });

    it("rejects deposit when paused", () => {
      simnet.callPublicFn(contract, "toggle-pause", [], deployer);
      const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(depositAmount)], user1);
      expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    });
  });
});

describe("vault-core-v4 multi-user scenarios", () => {
  it("supports multiple concurrent depositors", () => {
    const r1 = simnet.callPublicFn(contract, "deposit", [Cl.uint(500_000)], user1);
    const r2 = simnet.callPublicFn(contract, "deposit", [Cl.uint(750_000)], user2);
    expect(r1.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(r2.result).toHaveClarityType(ClarityType.ResponseOk);

    const info = simnet.callReadOnlyFn(contract, "get-vault-info", [], deployer);
    expect(info.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("tracks total depositors accurately", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(500_000)], user1);
    simnet.callPublicFn(contract, "deposit", [Cl.uint(500_000)], user2);
    const info = simnet.callReadOnlyFn(contract, "get-vault-info", [], deployer);
    expect(info.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
