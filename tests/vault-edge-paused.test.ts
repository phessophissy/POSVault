import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Paused Vault Operations
 *
 * Tests that the vault correctly blocks deposits when paused
 * and allows operations to resume after unpausing.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: paused vault operations", () => {
  it("reports is-paused as false initially", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "is-paused",
      [],
      deployer
    );
    expect(result.result).toEqual(Cl.bool(false));
  });

  it("deployer can pause the vault", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "toggle-pause",
      [],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("reports is-paused as true after pause", () => {
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "is-paused",
      [],
      deployer
    );
    expect(result.result).toEqual(Cl.bool(true));
  });

  it("rejects deposits when vault is paused", () => {
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1_000_000)],
      wallet1
    );
    result.result.expectErr().expectUint(204);
  });

  it("allows deposits after unpausing", () => {
    // Pause then unpause
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1_000_000)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("existing depositors can still withdraw while paused", () => {
    // Deposit first, then pause
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "withdraw",
      [],
      wallet1
    );
    // Withdraw should still work even when paused (user funds not locked)
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
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

  it("double toggle returns vault to unpaused", () => {
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);
    simnet.callPublicFn("vault-core-v4", "toggle-pause", [], deployer);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "is-paused",
      [],
      deployer
    );
    expect(result.result).toEqual(Cl.bool(false));
  });
});
