import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Zero-Amount & Boundary Deposits
 *
 * Tests covering deposit validation boundaries including
 * zero-value, minimum (1 µSTX), and very large values,
 * verifying the contract correctly rejects or accepts them.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: zero-amount and boundary deposits", () => {
  it("rejects a deposit of 0 µSTX with error 203", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(0)],
      wallet1
    );
    result.result.expectErr().expectUint(203);
  });

  it("accepts a deposit of exactly 1 µSTX", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("correctly records the 1 µSTX deposit in user stats", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1)], wallet1);

    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    const data = info.result.expectSome().expectTuple();
    expect(data["amount"]).toEqual(Cl.uint(1));
  });

  it("accepts a large deposit near u64 practical limits", () => {
    // 1 trillion µSTX = 1,000,000 STX
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1_000_000_000_000)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("updates total-stx-locked after large deposit", () => {
    const amount = 1_000_000_000_000;
    simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(amount)],
      wallet1
    );
    const info = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-vault-info",
      [],
      deployer
    );
    const data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(amount));
  });

  it("rejects a second deposit from a user who already deposited", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(500_000)], wallet1);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(500_000)],
      wallet1
    );
    result.result.expectErr().expectUint(201);
  });

  it("allows different wallets to deposit simultaneously", () => {
    const r1 = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(100_000)],
      wallet1
    );
    const r2 = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(200_000)],
      wallet2
    );
    expect(r1.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(r2.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
