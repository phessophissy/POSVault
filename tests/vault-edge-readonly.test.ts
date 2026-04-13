import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Read-Only Function Boundaries
 *
 * Tests that read-only query functions return correct types
 * and handle non-existent data gracefully (none vs default values).
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: read-only function boundaries", () => {
  it("get-deposit returns none for non-existent user", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    result.result.expectNone();
  });

  it("get-deposit returns some for existing depositor", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-deposit",
      [Cl.principal(wallet1)],
      deployer
    );
    result.result.expectSome();
  });

  it("get-user-stats returns tuple for depositor", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-user-stats",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.Tuple);
  });

  it("get-pending-rewards returns 0 for non-depositor", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result.result).toEqual(Cl.uint(0));
  });

  it("get-vault-info returns valid tuple with all fields", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-vault-info",
      [],
      deployer
    );
    const data = result.result.expectTuple();
    // Verify expected keys exist
    expect(data).toHaveProperty("total-stx-locked");
    expect(data).toHaveProperty("is-paused");
  });

  it("get-vault-info total is consistent after deposit and withdraw", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(800_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(200_000)], wallet2);

    let info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    let data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(1_000_000));

    simnet.callPublicFn("vault-core-v4", "withdraw", [], wallet2);

    info = simnet.callReadOnlyFn("vault-core-v4", "get-vault-info", [], deployer);
    data = info.result.expectTuple();
    expect(data["total-stx-locked"]).toEqual(Cl.uint(800_000));
  });

  it("is-paused returns bool type", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "is-paused",
      [],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.BoolFalse);
  });

  it("get-reward-rate returns uint type", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-reward-rate",
      [],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.UInt);
  });

  it("any principal can call read-only functions", () => {
    // Even wallet1 (not deployer) can query vault info
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-vault-info",
      [],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.Tuple);
  });
});
