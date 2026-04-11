import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
const vault = "vault-core-v4";
const govToken = "governance-token";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const user2 = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

describe("proposal creation", () => {
  it("creates general proposal", () => {
    simnet.callPublicFn(vault, "deposit", [Cl.uint(5_000_000)], user1);
    simnet.mineEmptyBlocks(200);
    simnet.callPublicFn(vault, "claim-rewards", [], user1);
    const result = simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("General vote"),
      Cl.stringUtf8("A test proposal"),
      Cl.stringAscii("general"),
      Cl.uint(0),
    ], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("creates reward-rate proposal", () => {
    simnet.callPublicFn(vault, "deposit", [Cl.uint(5_000_000)], user1);
    simnet.mineEmptyBlocks(200);
    simnet.callPublicFn(vault, "claim-rewards", [], user1);
    const result = simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Rate change"),
      Cl.stringUtf8("Set rate to 300"),
      Cl.stringAscii("reward-rate"),
      Cl.uint(300),
    ], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-proposal-count tracks proposals", () => {
    const count = simnet.callReadOnlyFn(voting, "get-proposal-count", [], deployer);
    expect(count.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
