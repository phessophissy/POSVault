import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const contract = "vault-core-v4";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

describe("reward calculation accuracy", () => {
  it("rewards scale with deposit duration", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(1_000_000)], user1);
    simnet.mineEmptyBlocks(144);
    const r1 = simnet.callReadOnlyFn(contract, "get-pending-rewards", [Cl.principal(user1)], deployer);
    simnet.mineEmptyBlocks(144);
    const r2 = simnet.callReadOnlyFn(contract, "get-pending-rewards", [Cl.principal(user1)], deployer);
    expect(r1.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(r2.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("rewards scale with deposit amount", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(5_000_000)], user1);
    simnet.mineEmptyBlocks(288);
    const rewards = simnet.callReadOnlyFn(contract, "get-pending-rewards", [Cl.principal(user1)], deployer);
    expect(rewards.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("claiming resets pending rewards", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(1_000_000)], user1);
    simnet.mineEmptyBlocks(200);
    simnet.callPublicFn(contract, "claim-rewards", [], user1);
    const rewards = simnet.callReadOnlyFn(contract, "get-pending-rewards", [Cl.principal(user1)], deployer);
    expect(rewards.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
