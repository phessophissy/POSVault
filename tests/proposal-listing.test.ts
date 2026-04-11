import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
describe("proposal listing functions", () => {
  it("get-proposal returns none for zero id", () => {
    const result = simnet.callReadOnlyFn(voting, "get-proposal", [Cl.uint(0)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.OptionalNone);
  });
  it("get-vote-record returns none when no vote cast", () => {
    const result = simnet.callReadOnlyFn(voting, "get-vote-record", [
      Cl.uint(1), Cl.principal(deployer)
    ], deployer);
    expect(result.result).toHaveClarityType(ClarityType.OptionalNone);
  });
});
