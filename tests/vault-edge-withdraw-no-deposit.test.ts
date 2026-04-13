import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Withdraw Without Deposit
 *
 * Verifies the vault correctly handles withdrawal attempts
 * from users who have no active deposit position.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: withdraw without deposit", () => {
  it("rejects withdraw from a user with no deposit", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "withdraw",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(202);
  });

  it("rejects claim-rewards from a user with no deposit", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "claim-rewards",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(202);
  });

  it("rejects withdraw from wallet2 when only wallet1 deposited", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "withdraw",
      [],
      wallet2
    );
    result.result.expectErr().expectUint(202);
  });

  it("allows withdraw after deposit", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "withdraw",
      [],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("rejects double withdraw (second attempt after already withdrawn)", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "withdraw",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(202);
  });

  it("shows no deposit record after withdrawal", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    info.result.expectNone();
  });
});
