import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Unauthorized Admin Operations
 *
 * Tests that non-admin users cannot perform admin-only
 * operations (add-admin, remove-admin, set-reward-rate,
 * toggle-pause, emergency-withdraw).
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: unauthorized admin operations", () => {
  it("rejects add-admin from non-deployer", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "add-admin",
      [Cl.principal(wallet2)],
      wallet1
    );
    result.result.expectErr().expectUint(100);
  });

  it("rejects remove-admin from non-deployer", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "remove-admin",
      [Cl.principal(wallet1)],
      wallet1
    );
    result.result.expectErr().expectUint(100);
  });

  it("rejects set-reward-rate from non-admin", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(500)],
      wallet1
    );
    result.result.expectErr().expectUint(100);
  });

  it("rejects toggle-pause from non-admin", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "toggle-pause",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(100);
  });

  it("rejects emergency-withdraw from non-admin", () => {
    // First, wallet1 deposits so there's something to withdraw
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);

    const result = simnet.callPublicFn(
      "vault-core-v4",
      "emergency-withdraw",
      [],
      wallet2
    );
    result.result.expectErr().expectUint(100);
  });

  it("allows deployer to add-admin successfully", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "add-admin",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("allows newly added admin to set-reward-rate", () => {
    simnet.callPublicFn(
      "vault-core-v4",
      "add-admin",
      [Cl.principal(wallet1)],
      deployer
    );
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(200)],
      wallet1
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("revoked admin can no longer toggle-pause", () => {
    // Add then remove wallet1 as admin
    simnet.callPublicFn(
      "vault-core-v4",
      "add-admin",
      [Cl.principal(wallet1)],
      deployer
    );
    simnet.callPublicFn(
      "vault-core-v4",
      "remove-admin",
      [Cl.principal(wallet1)],
      deployer
    );
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "toggle-pause",
      [],
      wallet1
    );
    result.result.expectErr().expectUint(100);
  });
});
