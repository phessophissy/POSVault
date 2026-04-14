import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Emergency Withdraw Scenarios
 *
 * Tests emergency withdrawal paths including authorization,
 * interaction with paused state, and post-withdraw vault state.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: emergency withdraw scenarios", () => {
  it("emergency-withdraw fails with no deposit", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "emergency-withdraw",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(202);
  });

  it("emergency-withdraw succeeds for depositor", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(5_000_000)], wallet1);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "emergency-withdraw",
      [],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("deposit record is cleared after emergency withdraw", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(5_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "emergency-withdraw", [], wallet1);

    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    info.result.expectNone();
  });

  it("total-stx-locked decreases after emergency withdraw", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(5_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(3_000_000)], wallet2);

    // wallet1 emergency withdraws
    simnet.callPublicFn("vault-core-v4", "emergency-withdraw", [], wallet1);

    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-vault-info",
      [],
      deployer
    );
    const data = info.result.expectTuple();
    // Only wallet2's deposit should remain
    expect(data["total-stx-locked"]).toEqual(Cl.uint(3_000_000));
  });

  it("user can redeposit after emergency withdraw", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "emergency-withdraw", [], wallet1);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(2_000_000)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("double emergency withdraw fails", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "emergency-withdraw", [], wallet1);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "emergency-withdraw",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(202);
  });

  it("emergency-withdraw works while vault is paused", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "emergency-withdraw",
      [],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
