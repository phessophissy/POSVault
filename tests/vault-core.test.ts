import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-core", () => {
  // ==========================================
  // Deposits
  // ==========================================

  it("should allow deposits", () => {
    const result = simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(10000000)], // 10 STX
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should record deposit data correctly", () => {
    simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(5000000)], // 5 STX
      wallet1
    );

    const deposit = simnet.callReadOnlyFn(
      "vault-core",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );

    // Should have deposit with correct amount
    expect(deposit.result).not.toBeNone();
  });

  it("should reject duplicate deposits", () => {
    simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(5000000)],
      wallet1
    );

    const result = simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(3000000)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(205)); // ERR-ALREADY-DEPOSITED
  });

  it("should reject zero deposits", () => {
    const result = simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(0)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(203)); // ERR-INVALID-AMOUNT
  });

  // ==========================================
  // Withdrawals
  // ==========================================

  it("should allow withdrawals", () => {
    simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(10000000)],
      wallet1
    );

    const result = simnet.callPublicFn(
      "vault-core",
      "withdraw",
      [],
      wallet1
    );
    expect(result.result).toBeOk(
      Cl.tuple({
        "stx-returned": Cl.uint(10000000),
        "rewards-earned": Cl.uint(0), // No rewards in same block
      })
    );
  });

  it("should reject withdrawal with no deposit", () => {
    const result = simnet.callPublicFn(
      "vault-core",
      "withdraw",
      [],
      wallet2
    );
    expect(result.result).toBeErr(Cl.uint(206)); // ERR-NO-DEPOSIT
  });

  // ==========================================
  // Vault Info
  // ==========================================

  it("should track total deposits", () => {
    simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(10000000)],
      wallet1
    );
    simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(20000000)],
      wallet2
    );

    const info = simnet.callReadOnlyFn(
      "vault-core",
      "get-vault-info",
      [],
      deployer
    );
    // Should show 30 STX locked
    expect(info.result).toBeOk(
      Cl.tuple({
        "total-stx-locked": Cl.uint(30000000),
        "total-depositors": Cl.uint(2),
        "reward-rate": Cl.uint(100),
        "is-paused": Cl.bool(false),
        "current-block": Cl.uint(simnet.blockHeight),
      })
    );
  });

  // ==========================================
  // User Stats
  // ==========================================

  it("should update user stats on deposit", () => {
    simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(8000000)],
      wallet1
    );

    const stats = simnet.callReadOnlyFn(
      "vault-core",
      "get-user-stats",
      [Cl.principal(wallet1)],
      deployer
    );

    expect(stats.result).toBeTuple({
      "total-deposited": Cl.uint(8000000),
      "total-withdrawn": Cl.uint(0),
      "total-rewards": Cl.uint(0),
      "deposit-count": Cl.uint(1),
    });
  });

  // ==========================================
  // Admin Functions
  // ==========================================

  it("should allow owner to set reward rate", () => {
    const result = simnet.callPublicFn(
      "vault-core",
      "set-reward-rate",
      [Cl.uint(200)],
      deployer
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should prevent non-owner from setting reward rate", () => {
    const result = simnet.callPublicFn(
      "vault-core",
      "set-reward-rate",
      [Cl.uint(200)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(200)); // ERR-NOT-AUTHORIZED
  });

  it("should allow owner to toggle pause", () => {
    const result = simnet.callPublicFn(
      "vault-core",
      "toggle-pause",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should reject deposits when paused", () => {
    simnet.callPublicFn("vault-core", "toggle-pause", [], deployer);

    const result = simnet.callPublicFn(
      "vault-core",
      "deposit",
      [Cl.uint(5000000)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(207)); // ERR-VAULT-PAUSED
  });

  it("should allow authorized admin to set reward rate", () => {
    // Add wallet1 as admin
    simnet.callPublicFn(
      "vault-core",
      "add-admin",
      [Cl.principal(wallet1)],
      deployer
    );

    const result = simnet.callPublicFn(
      "vault-core",
      "set-reward-rate",
      [Cl.uint(300)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });
});
