import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const vault = "vault-core-v4";
const voting = "proposal-voting";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
describe("proposal types", () => {
  it("supports pause type proposals", () => {
    simnet.callPublicFn(vault, "deposit", [Cl.uint(5_000_000)], user1);
    simnet.mineEmptyBlocks(200);
    simnet.callPublicFn(vault, "claim-rewards", [], user1);
    const result = simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Pause"), Cl.stringUtf8("Pause vault"), Cl.stringAscii("pause"), Cl.uint(0)
    ], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
