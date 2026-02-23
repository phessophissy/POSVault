import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("proposal-voting", () => {
  // Helper: mint tokens so wallet1 can create proposals
  function setupTokens() {
    simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(10000000), Cl.principal(wallet1)], // 10 POS-GOV
      deployer
    );
    simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(5000000), Cl.principal(wallet2)], // 5 POS-GOV
      deployer
    );
  }

  // ==========================================
  // Proposal Creation
  // ==========================================

  it("should allow token holders to create proposals", () => {
    setupTokens();

    const result = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Increase reward rate"),
        Cl.stringUtf8("Proposal to increase the vault reward rate to 2%"),
        Cl.stringAscii("reward-rate"),
        Cl.uint(200),
      ],
      wallet1
    );
    expect(result.result).toBeOk(Cl.uint(1));
  });

  it("should prevent users without tokens from creating proposals", () => {
    const result = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Invalid proposal"),
        Cl.stringUtf8("Should fail"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet2 // Has no tokens yet
    );
    expect(result.result).toBeErr(Cl.uint(306)); // ERR-INSUFFICIENT-TOKENS
  });

  it("should reject invalid proposal types", () => {
    setupTokens();

    const result = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Bad type"),
        Cl.stringUtf8("Invalid proposal type"),
        Cl.stringAscii("invalid"),
        Cl.uint(0),
      ],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(308)); // ERR-INVALID-PROPOSAL
  });

  it("should reject general proposals with non-zero value", () => {
    setupTokens();

    const result = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("General should not set value"),
        Cl.stringUtf8("General proposals must keep value at zero"),
        Cl.stringAscii("general"),
        Cl.uint(1),
      ],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(308)); // ERR-INVALID-PROPOSAL
  });

  it("should reject reward-rate proposals with zero value", () => {
    setupTokens();

    const result = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Reward rate zero"),
        Cl.stringUtf8("Reward rate proposals must be greater than zero"),
        Cl.stringAscii("reward-rate"),
        Cl.uint(0),
      ],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(308)); // ERR-INVALID-PROPOSAL
  });

  it("should block creating a second active proposal by the same proposer", () => {
    setupTokens();

    const first = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("First active proposal"),
        Cl.stringUtf8("Still active"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );
    expect(first.result).toBeOk(Cl.uint(1));

    const second = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Second active proposal"),
        Cl.stringUtf8("Should fail while first is active"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );
    expect(second.result).toBeErr(Cl.uint(309)); // ERR-VOTING-ACTIVE
  });

  it("should allow a new proposal after the previous one is no longer active", () => {
    setupTokens();

    const first = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("First proposal"),
        Cl.stringUtf8("Will expire without execution"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );
    expect(first.result).toBeOk(Cl.uint(1));

    simnet.mineEmptyBlocks(1009); // Move beyond VOTING-PERIOD

    const second = simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Second proposal"),
        Cl.stringUtf8("Allowed after first expires"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );
    expect(second.result).toBeOk(Cl.uint(2));
  });

  it("should increment proposal count", () => {
    setupTokens();

    simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("First proposal"),
        Cl.stringUtf8("Description"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );

    const count = simnet.callReadOnlyFn(
      "proposal-voting",
      "get-proposal-count",
      [],
      deployer
    );
    expect(count.result).toBeOk(Cl.uint(1));
  });

  // ==========================================
  // Voting
  // ==========================================

  it("should allow token holders to vote", () => {
    setupTokens();

    // Create proposal
    simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Test voting"),
        Cl.stringUtf8("A proposal to test voting"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );

    // Vote
    const result = simnet.callPublicFn(
      "proposal-voting",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should prevent double voting", () => {
    setupTokens();

    simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Double vote test"),
        Cl.stringUtf8("Testing"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );

    // First vote
    simnet.callPublicFn(
      "proposal-voting",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet1
    );

    // Second vote should fail
    const result = simnet.callPublicFn(
      "proposal-voting",
      "vote",
      [Cl.uint(1), Cl.bool(false)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(302)); // ERR-ALREADY-VOTED
  });

  it("should prevent voting on non-existent proposal", () => {
    setupTokens();

    const result = simnet.callPublicFn(
      "proposal-voting",
      "vote",
      [Cl.uint(999), Cl.bool(true)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(301)); // ERR-PROPOSAL-NOT-FOUND
  });

  // ==========================================
  // Read-Only Functions
  // ==========================================

  it("should return voting period", () => {
    const result = simnet.callReadOnlyFn(
      "proposal-voting",
      "get-voting-period",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.uint(1008));
  });

  it("should return minimum proposal tokens", () => {
    const result = simnet.callReadOnlyFn(
      "proposal-voting",
      "get-min-proposal-tokens",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.uint(1000000));
  });

  it("should return vote record", () => {
    setupTokens();

    simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("Vote record test"),
        Cl.stringUtf8("Test description"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );

    simnet.callPublicFn(
      "proposal-voting",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet1
    );

    const record = simnet.callReadOnlyFn(
      "proposal-voting",
      "get-vote-record",
      [Cl.uint(1), Cl.principal(wallet1)],
      deployer
    );
    expect(record.result).not.toBeNone();
  });

  it("should clear active proposal after execution", () => {
    setupTokens();

    simnet.callPublicFn(
      "proposal-voting",
      "create-proposal",
      [
        Cl.stringUtf8("General execution"),
        Cl.stringUtf8("Should clear active proposal pointer"),
        Cl.stringAscii("general"),
        Cl.uint(0),
      ],
      wallet1
    );

    simnet.callPublicFn(
      "proposal-voting",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet1
    );

    simnet.mineEmptyBlocks(1009); // Move past voting window

    const execute = simnet.callPublicFn(
      "proposal-voting",
      "execute-proposal",
      [Cl.uint(1)],
      wallet2
    );
    expect(execute.result).toBeOk(Cl.bool(true));

    const active = simnet.callReadOnlyFn(
      "proposal-voting",
      "get-user-active-proposal",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(active.result).toBeNone();
  });
});
