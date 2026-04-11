import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
const vault = "vault-core-v4";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

describe("proposal execution", () => {
  it("cannot execute before voting ends", () => {
    simnet.callPublicFn(vault, "deposit", [Cl.uint(5_000_000)], user1);
    simnet.mineEmptyBlocks(200);
    simnet.callPublicFn(vault, "claim-rewards", [], user1);
    simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Test"), Cl.stringUtf8("Desc"), Cl.stringAscii("general"), Cl.uint(0)
    ], user1);
    simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(true)], user1);
    const result = simnet.callPublicFn(voting, "execute-proposal", [Cl.uint(1)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });

  it("get-proposal-result returns result data", () => {
    const result = simnet.callReadOnlyFn(voting, "get-proposal-result", [Cl.uint(1)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("is-voting-active checks status", () => {
    const result = simnet.callReadOnlyFn(voting, "is-voting-active", [Cl.uint(1)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
