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
