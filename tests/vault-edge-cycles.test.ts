import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Deposit-Withdraw-Redeposit Cycles
 *
 * Tests repeated deposit/withdraw cycles to verify the vault
 * handles state transitions correctly across multiple cycles,
 * with varying amounts.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("vault-edge: deposit-withdraw-redeposit cycles", () => {
  it("single cycle: deposit → withdraw → redeposit", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(2_000_000)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("redeposit amount is correctly recorded", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(3_500_000)], wallet1);

    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    const data = info.result.expectSome().expectTuple();
    expect(data["amount"]).toEqual(Cl.uint(3_500_000));
  });

  it("vault total tracks correctly across cycles", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);

    let info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    let data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(1_000_000));

    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(0));

    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(5_000_000)], wallet1);

    info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(5_000_000));
  });

  it("double cycle: deposit → withdraw → redeposit → withdraw → redeposit", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(500_000)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);

    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    const data = info.result.expectSome().expectTuple();
    expect(data["amount"]).toEqual(Cl.uint(500_000));
  });

  it("claim rewards between cycles", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.mineEmptyBlocks(5);

    // Claim rewards, then withdraw
    const claimResult = simnet.callPublicFn(
      "vault-core-v4",
      "claim-rewards",
      [],
      wallet1
    );
    expect(claimResult.result).toHaveClarityType(ClarityType.ResponseOk);

    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    // Redeposit and mine more blocks
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(2_000_000)], wallet1);
    simnet.mineEmptyBlocks(3);

    const pendingResult = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(pendingResult.result).toHaveClarityType(ClarityType.UInt);
  });

  it("minimum redeposit (1 µSTX) after withdrawing large amount", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(100_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet1);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
