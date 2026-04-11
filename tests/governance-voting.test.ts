import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
import { DEPLOYER, USER1, USER2, DEPOSIT_5_STX, BLOCKS_PER_CYCLE, CONTRACTS, depositAs, claimAs } from "./helpers";

describe("governance voting flow", () => {
  it("create proposal requires governance tokens", () => {
    depositAs(USER1, DEPOSIT_5_STX);
    simnet.mineEmptyBlocks(BLOCKS_PER_CYCLE);
    claimAs(USER1);

    const result = simnet.callPublicFn(CONTRACTS.proposalVoting, "create-proposal", [
      Cl.stringUtf8("Adjust rate"),
      Cl.stringUtf8("Set reward rate to 200bp"),
      Cl.stringAscii("reward-rate"),
      Cl.uint(200),
    ], USER1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("voting on proposal records vote", () => {
    depositAs(USER1, DEPOSIT_5_STX);
    simnet.mineEmptyBlocks(BLOCKS_PER_CYCLE);
    claimAs(USER1);

    simnet.callPublicFn(CONTRACTS.proposalVoting, "create-proposal", [
      Cl.stringUtf8("Test proposal"),
      Cl.stringUtf8("Test description"),
      Cl.stringAscii("general"),
      Cl.uint(0),
    ], USER1);

    const vote = simnet.callPublicFn(CONTRACTS.proposalVoting, "vote", [
      Cl.uint(1),
      Cl.bool(true),
    ], USER1);
    expect(vote.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-proposal returns proposal data", () => {
    depositAs(USER1, DEPOSIT_5_STX);
    simnet.mineEmptyBlocks(BLOCKS_PER_CYCLE);
    claimAs(USER1);

    simnet.callPublicFn(CONTRACTS.proposalVoting, "create-proposal", [
      Cl.stringUtf8("Rate change"),
      Cl.stringUtf8("Increase rewards"),
      Cl.stringAscii("reward-rate"),
      Cl.uint(300),
    ], USER1);

    const proposal = simnet.callReadOnlyFn(CONTRACTS.proposalVoting, "get-proposal", [Cl.uint(1)], DEPLOYER);
    expect(proposal.result).toHaveClarityType(ClarityType.OptionalSome);
  });
});
