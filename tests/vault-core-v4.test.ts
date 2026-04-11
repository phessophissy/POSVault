import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-core-v4", () => {
  describe("initialization", () => {
    it("starts with zero total locked", () => {
      const result = simnet.callReadOnlyFn(
        "vault-core-v4",
        "get-vault-info",
        [],
        deployer
      );
      const data = result.result.expectTuple();
      expect(data["total-stx-locked"]).toEqual(Cl.uint(0));
    });

    it("starts unpaused", () => {
      const result = simnet.callReadOnlyFn(
        "vault-core-v4",
        "get-vault-info",
        [],
        deployer
      );
      const data = result.result.expectTuple();
      expect(data["is-paused"]).toEqual(Cl.bool(false));
    });
  });
});

describe("vault-core-v4 deposits", () => {
  it("allows a deposit of valid amount", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1000000)],
      wallet1
    );
    result.result.expectOk().expectBool(true);
  });

  it("rejects zero deposit", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(0)],
      wallet1
    );
    result.result.expectErr().expectUint(203);
  });

  it("rejects duplicate deposit from same wallet", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(500000)], wallet1);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(500000)],
      wallet1
    );
    result.result.expectErr().expectUint(205);
  });
});

describe("vault-core-v4 withdrawals", () => {
  it("allows withdrawal after deposit", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1000000)], wallet2);
    simnet.mineEmptyBlocks(150);
    const result = simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet2);
    result.result.expectOk();
  });

  it("rejects withdrawal without deposit", () => {
    const result = simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet2);
    result.result.expectErr().expectUint(206);
  });
});

describe("vault-core-v4 rewards", () => {
  it("calculates pending rewards after blocks", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2000000)], wallet1);
    simnet.mineEmptyBlocks(144);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      wallet1
    );
    const rewards = result.result.expectOk().expectUint();
    expect(Number(rewards)).toBeGreaterThan(0);
  });

  it("returns zero rewards immediately after deposit", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1000000)], wallet2);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet2)],
      wallet2
    );
    result.result.expectOk().expectUint(0);
  });
});

describe("vault-core-v4 claim-rewards", () => {
  it("claims rewards and mints tokens via as-contract", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(5000000)], wallet1);
    simnet.mineEmptyBlocks(288);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "claim-rewards",
      [],
      wallet1
    );
    result.result.expectOk();
    const balance = simnet.callReadOnlyFn(
      "governance-token",
      "get-balance",
      [Cl.principal(wallet1)],
      wallet1
    );
    const bal = balance.result.expectOk().expectUint();
    expect(Number(bal)).toBeGreaterThan(0);
  });
});

describe("vault-core-v4 admin controls", () => {
  it("owner can pause the vault", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "toggle-pause",
      [],
      deployer
    );
    result.result.expectOk().expectBool(true);
  });

  it("non-owner cannot pause the vault", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "toggle-pause",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(200);
  });

  it("owner can set reward rate", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(250)],
      deployer
    );
    result.result.expectOk().expectBool(true);
  });

  it("rejects deposits when paused", () => {
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1000000)],
      wallet1
    );
    result.result.expectErr().expectUint(207);
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);
  });
});

describe("vault-core-v4 user stats", () => {
  it("tracks deposit count correctly", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1000000)], wallet1);
    const stats = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-user-stats",
      [Cl.principal(wallet1)],
      wallet1
    );
    const data = stats.result.expectTuple();
    expect(Number(data["deposit-count"])).toBeGreaterThanOrEqual(1);
  });

  it("tracks total deposited amount", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2000000)], wallet2);
    const stats = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-user-stats",
      [Cl.principal(wallet2)],
      wallet2
    );
    const data = stats.result.expectTuple();
    expect(Number(data["total-deposited"])).toEqual(2000000);
  });
});

describe("vault-core-v4 get-deposit", () => {
  it("returns none for non-depositor", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet2)],
      wallet2
    );
    result.result.expectNone();
  });

  it("returns deposit details for depositor", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(3000000)], wallet1);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      wallet1
    );
    const deposit = result.result.expectSome().expectTuple();
    expect(Number(deposit["amount"])).toEqual(3000000);
  });
});

describe("vault-core-v4 vault info updates", () => {
  it("increments total-depositors on deposit", () => {
    const before = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const countBefore = Number(before.result.expectTuple()["total-depositors"]);

    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(500000)], wallet1);

    const after = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const countAfter = Number(after.result.expectTuple()["total-depositors"]);

    expect(countAfter).toEqual(countBefore + 1);
  });

  it("updates total-stx-locked on deposit", () => {
    const before = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const lockedBefore = Number(before.result.expectTuple()["total-stx-locked"]);

    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1000000)], wallet2);

    const after = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const lockedAfter = Number(after.result.expectTuple()["total-stx-locked"]);

    expect(lockedAfter).toEqual(lockedBefore + 1000000);
  });
});
