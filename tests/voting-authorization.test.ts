import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
const user3 = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC";
describe("voting authorization", () => {
  it("user without tokens cannot create proposal", () => {
    const result = simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Unauthorized"), Cl.stringUtf8("Should fail"),
      Cl.stringAscii("general"), Cl.uint(0)
    ], user3);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });
  it("user without tokens cannot vote", () => {
    const result = simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(true)], user3);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });
});
