import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
describe("proposal read-only", () => {
  it("get-proposal returns none for invalid id", () => {
    const result = simnet.callReadOnlyFn(voting, "get-proposal", [Cl.uint(999)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.OptionalNone);
  });
});
