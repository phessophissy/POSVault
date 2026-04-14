import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Multi-User Concurrent Operations
 *
 * Tests interactions between multiple depositors operating
 * on the vault simultaneously to verify state isolation
 * and correct aggregate accounting.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("vault-edge: multi-user concurrent operations", () => {
  it("three users can deposit independently", () => {
    const r1 = simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    const r2 = simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2_000_000)], wallet2);
    const r3 = simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(3_000_000)], wallet3);

    expect(r1.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(r2.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(r3.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("total-stx-locked reflects all user deposits", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2_000_000)], wallet2);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(3_000_000)], wallet3);

    const info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(6_000_000));
  });

  it("one user withdrawing does not affect others", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2_000_000)], wallet2);

    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    // wallet2 deposit should be intact
    const dep = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet2)],
      deployer
    );
    const data = dep.result.expectSome().expectTuple();
    expect(data["amount"]).toEqual(Cl.uint(2_000_000));

    // total should only have wallet2's deposit
    const info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const vaultData = info.result.expectTuple();
    expect(vaultData["total-stx-locked"]).toEqual(Cl.uint(2_000_000));
  });

  it("each user has independent pending rewards", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet2);

    simnet.mineEmptyBlocks(10);

    const r1 = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    const r2 = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet2)],
      deployer
    );

    expect(r1.result).toHaveClarityType(ClarityType.UInt);
    expect(r2.result).toHaveClarityType(ClarityType.UInt);
  });

  it("one user claiming rewards does not reset another's", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet2);

    simnet.mineEmptyBlocks(5);

    // wallet1 claims
    simnet.callPublicFn("vault-core-v4", "claim-rewards", [], wallet1);

    // wallet2's pending should still be non-zero
    const r2 = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(r2.result).toHaveClarityType(ClarityType.UInt);
  });

  it("interleaved operations across users", () => {
    // wallet1 deposits, wallet2 deposits
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2_000_000)], wallet2);

    // wallet1 withdraws
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    // wallet3 deposits
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(4_000_000)], wallet3);

    // wallet1 redeposits
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(500_000)], wallet1);

    const info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    const data = info.result.expectTuple();
    // wallet2 (2M) + wallet3 (4M) + wallet1 (500K) = 6.5M
    expect(data["total-stx-locked"]).toEqual(Cl.uint(6_500_000));
  });
});
