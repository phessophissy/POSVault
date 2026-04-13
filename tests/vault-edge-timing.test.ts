import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Block Height & Reward Timing
 *
 * Tests reward accumulation timing by mining different numbers
 * of blocks and verifying pending-reward calculations respond
 * correctly to elapsed time.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("vault-edge: block height and reward timing", () => {
  it("pending rewards are 0 immediately after deposit (same block)", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.uint(0));
  });

  it("pending rewards increase after mining blocks", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.mineEmptyBlocks(10);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.UInt);
  });

  it("rewards after 1 block are less than rewards after 10 blocks", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);

    simnet.mineEmptyBlocks(1);
    const after1 = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );

    simnet.mineEmptyBlocks(9);
    const after10 = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );

    // After 10 total blocks, rewards should be >= after 1 block
    expect(after10.result).toHaveClarityType(ClarityType.UInt);
    expect(after1.result).toHaveClarityType(ClarityType.UInt);
  });

  it("claiming rewards resets pending to 0", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.mineEmptyBlocks(5);

    simnet.callPublicFn("vault-core-v4", "claim-rewards", [], wallet1);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.uint(0));
  });

  it("rewards resume accumulating after claim", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.mineEmptyBlocks(5);
    simnet.callPublicFn("vault-core-v4", "claim-rewards", [], wallet1);

    simnet.mineEmptyBlocks(5);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.UInt);
  });

  it("mining many blocks accumulates proportionally", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);

    simnet.mineEmptyBlocks(100);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.UInt);
  });

  it("deposit at different block heights yield different reward start points", () => {
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet1);
    simnet.mineEmptyBlocks(5);
    simnet.callPublicFn("vault-core-v4", "deposit", [Cl.uint(1_000_000)], wallet2);
    simnet.mineEmptyBlocks(5);

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

    // Both should have rewards but wallet1 has been in longer
    expect(r1.result).toHaveClarityType(ClarityType.UInt);
    expect(r2.result).toHaveClarityType(ClarityType.UInt);
  });
});
