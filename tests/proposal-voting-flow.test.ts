import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const voting = "proposal-voting";
const vault = "vault-core-v4";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const user2 = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

function setupVoter(user: string) {
  simnet.callPublicFn(vault, "deposit", [Cl.uint(5_000_000)], user);
  simnet.mineEmptyBlocks(200);
  simnet.callPublicFn(vault, "claim-rewards", [], user);
}

describe("voting flow", () => {
  it("user can vote for a proposal", () => {
    setupVoter(user1);
    simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Test"), Cl.stringUtf8("Desc"), Cl.stringAscii("general"), Cl.uint(0)
    ], user1);
    const result = simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(true)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("user can vote against a proposal", () => {
    setupVoter(user1);
    setupVoter(user2);
    simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Test"), Cl.stringUtf8("Desc"), Cl.stringAscii("general"), Cl.uint(0)
    ], user1);
    const result = simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(false)], user2);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-vote-record returns voter data", () => {
    setupVoter(user1);
    simnet.callPublicFn(voting, "create-proposal", [
      Cl.stringUtf8("Test"), Cl.stringUtf8("Desc"), Cl.stringAscii("general"), Cl.uint(0)
    ], user1);
    simnet.callPublicFn(voting, "vote", [Cl.uint(1), Cl.bool(true)], user1);
    const record = simnet.callReadOnlyFn(voting, "get-vote-record", [Cl.uint(1), Cl.principal(user1)], deployer);
    expect(record.result).toHaveClarityType(ClarityType.OptionalSome);
  });
});
