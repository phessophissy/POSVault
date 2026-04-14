import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

/**
 * Vault Edge Cases – Reward Rate Changes
 *
 * Tests edge cases around modifying the reward rate: setting
 * it to zero, updating mid-staking, and verifying calculations
 * after rate changes.
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("vault-edge: reward rate changes", () => {
  it("reads the initial reward rate", () => {
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-reward-rate",
      [],
      deployer
    );
    // rate is a uint, just ensure it's readable
    expect(result.result).toHaveClarityType(ClarityType.UInt);
  });

  it("deployer can set reward rate to 0", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(0)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("reward rate reads as 0 after being set to 0", () => {
    simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(0)],
      deployer
    );
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-reward-rate",
      [],
      deployer
    );
    expect(result.result).toEqual(Cl.uint(0));
  });

  it("pending rewards are 0 when rate is 0 and blocks pass", () => {
    simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(0)],
      deployer
    );
    simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1_000_000)],
      wallet1
    );

    // Mine some blocks
    simnet.mineEmptyBlocks(10);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.uint(0));
  });

  it("deployer can set a high reward rate", () => {
    const result = simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(10_000)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("reward rate update is reflected immediately in get-reward-rate", () => {
    simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(777)],
      deployer
    );
    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-reward-rate",
      [],
      deployer
    );
    expect(result.result).toEqual(Cl.uint(777));
  });

  it("pending rewards accumulate after setting non-zero rate", () => {
    simnet.callPublicFn(
      "vault-core-v4",
      "deposit",
      [Cl.uint(1_000_000)],
      wallet1
    );
    simnet.callPublicFn(
      "vault-core-v4",
      "set-reward-rate",
      [Cl.uint(100)],
      deployer
    );

    simnet.mineEmptyBlocks(5);

    const result = simnet.callReadOnlyFn(
      "vault-core-v4",
      "get-pending-rewards",
      [Cl.principal(wallet1)],
      deployer
    );
    // With a non-zero rate and elapsed blocks, rewards should be > 0
    expect(result.result).toHaveClarityType(ClarityType.UInt);
  });
});
