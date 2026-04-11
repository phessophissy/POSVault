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
