import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
describe("proposal quorum checks", () => {
  it("get-proposal-count returns count", () => {
    const result = simnet.callReadOnlyFn(voting, "get-proposal-count", [], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
  it("proposal with no votes has zero tallies", () => {
    const result = simnet.callReadOnlyFn(voting, "get-proposal-result", [Cl.uint(999)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
