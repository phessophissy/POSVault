import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const vault = "vault-core-v4";
const voting = "proposal-voting";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const user2 = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
describe("multi-voter scenarios", () => {
  it("multiple voters can participate", () => {
    for (const u of [user1, user2]) {
      simnet.callPublicFn(vault, "deposit", [Cl.uint(5_000_000)], u);
    }
    simnet.mineEmptyBlocks(200);
    for (const u of [user1, user2]) {
      simnet.callPublicFn(vault, "claim-rewards", [], u);
    }
    simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Multi"), Cl.stringUtf8("Test"), Cl.stringAscii("general"), Cl.uint(0)
    ], user1);
    const r1 = simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(true)], user1);
    const r2 = simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(false)], user2);
    expect(r1.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(r2.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
