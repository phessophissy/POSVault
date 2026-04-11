import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
describe("voting edge cases", () => {
  it("cannot vote on non-existent proposal", () => {
    const result = simnet.callPublicFn(voting, "vote", [Cl.uint(999), Cl.bool(true)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });
});
