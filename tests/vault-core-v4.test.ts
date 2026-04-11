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
