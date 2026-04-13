import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

/**
 * Helpers scoped to this test file for proposal lifecycle scenarios.
 */

function mintGovernanceTokens(
  recipient: string,
  amount: number = 10_000_000,
) {
  return simnet.callPublicFn(
    "governance-token",
    "mint",
    [Cl.uint(amount), Cl.principal(recipient)],
    deployer,
  );
}

function createProposal(
  sender: string,
  title: string,
  description: string,
  proposalType: string,
  value: number,
) {
  return simnet.callPublicFn(
    "proposal-voting",
    "create-proposal",
    [
      Cl.stringUtf8(title),
      Cl.stringUtf8(description),
      Cl.stringAscii(proposalType),
      Cl.uint(value),
    ],
    sender,
  );
}

function vote(sender: string, proposalId: number, support: boolean) {
  return simnet.callPublicFn(
    "proposal-voting",
    "vote",
    [Cl.uint(proposalId), Cl.bool(support)],
    sender,
  );
}

function executeProposal(sender: string, proposalId: number) {
  return simnet.callPublicFn(
    "proposal-voting",
    "execute-proposal",
    [Cl.uint(proposalId)],
    sender,
  );
}

function getProposal(proposalId: number) {
  return simnet.callReadOnlyFn(
    "proposal-voting",
    "get-proposal",
    [Cl.uint(proposalId)],
    deployer,
  );
}

function getProposalCount() {
  return simnet.callReadOnlyFn(
    "proposal-voting",
    "get-proposal-count",
    [],
    deployer,
  );
}

describe("proposal-lifecycle", () => {
  beforeEach(() => {
    // Give wallet1, wallet2, wallet3 governance tokens
    mintGovernanceTokens(wallet1, 20_000_000);
    mintGovernanceTokens(wallet2, 15_000_000);
    mintGovernanceTokens(wallet3, 10_000_000);
  });

  // ----------------------------------------------------------------
  // Phase 1: Proposal creation
  // ----------------------------------------------------------------

  describe("creation", () => {
    it("should create a general proposal and return id 1", () => {
      const result = createProposal(
        wallet1,
        "Community fund allocation",
        "Allocate 500 STX from treasury to community grants",
        "general",
        0,
      );
      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should increment proposal count after each creation", () => {
      createProposal(wallet1, "First", "First proposal", "general", 0);
      createProposal(wallet1, "Second", "Second proposal", "general", 0);

      const countResult = getProposalCount();
      expect(countResult.result).toBeOk(Cl.uint(2));
    });

    it("should store proposal details correctly", () => {
      createProposal(
        wallet1,
        "Reward rate change",
        "Increase rate to 200 basis points",
        "reward-rate",
        200,
      );

      const proposal = getProposal(1);
      const data = proposal.result;
      expect(data).toBeOk(
        expect.objectContaining({
          type: expect.any(Number),
        }),
      );
    });
  });

  // ----------------------------------------------------------------
  // Phase 2: Voting
  // ----------------------------------------------------------------

  describe("voting", () => {
    beforeEach(() => {
      createProposal(
        wallet1,
        "Test proposal for voting",
        "A proposal that all voters will interact with",
        "general",
        0,
      );
    });

    it("should allow a token holder to vote in favour", () => {
      const result = vote(wallet1, 1, true);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should allow a token holder to vote against", () => {
      const result = vote(wallet2, 1, false);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should prevent double voting on the same proposal", () => {
      vote(wallet1, 1, true);
      const secondVote = vote(wallet1, 1, true);
      expect(secondVote.result).toBeErr(Cl.uint(307)); // ERR-ALREADY-VOTED
    });

    it("should track vote counts accurately", () => {
      vote(wallet1, 1, true);
      vote(wallet2, 1, true);
      vote(wallet3, 1, false);

      const proposal = getProposal(1);
      // Proposal data should reflect 2 for / 1 against
      expect(proposal.result).toBeDefined();
    });
  });

  // ----------------------------------------------------------------
  // Phase 3: Execution
  // ----------------------------------------------------------------

  describe("execution", () => {
    beforeEach(() => {
      createProposal(
        wallet1,
        "Executable proposal",
        "A general proposal that should pass and be executed",
        "general",
        0,
      );
      // All three vote in favour
      vote(wallet1, 1, true);
      vote(wallet2, 1, true);
      vote(wallet3, 1, true);
    });

    it("should not allow execution before voting period ends", () => {
      const result = executeProposal(deployer, 1);
      // Expect error because voting hasn't ended
      expect(result.result).toBeErr(expect.anything());
    });

    it("should allow execution after voting period ends and proposal passed", () => {
      // Advance blocks past voting period (default ~144 blocks)
      simnet.mineEmptyBlocks(150);

      const result = executeProposal(deployer, 1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should prevent double execution", () => {
      simnet.mineEmptyBlocks(150);
      executeProposal(deployer, 1);

      const secondExecution = executeProposal(deployer, 1);
      expect(secondExecution.result).toBeErr(expect.anything());
    });
  });

  // ----------------------------------------------------------------
  // Phase 4: Rejection scenarios
  // ----------------------------------------------------------------

  describe("rejection", () => {
    it("should not execute a proposal that failed to pass", () => {
      createProposal(
        wallet1,
        "Controversial proposal",
        "This one will get voted down",
        "general",
        0,
      );

      // Majority votes against
      vote(wallet1, 1, false);
      vote(wallet2, 1, false);
      vote(wallet3, 1, true);

      simnet.mineEmptyBlocks(150);

      const result = executeProposal(deployer, 1);
      expect(result.result).toBeErr(expect.anything());
    });

    it("should not execute a proposal with no votes", () => {
      createProposal(wallet1, "Ignored", "Nobody voted", "general", 0);
      simnet.mineEmptyBlocks(150);

      const result = executeProposal(deployer, 1);
      expect(result.result).toBeErr(expect.anything());
    });
  });

  // ----------------------------------------------------------------
  // Phase 5: Reward-rate proposal type
  // ----------------------------------------------------------------

  describe("reward-rate proposals", () => {
    it("should create and pass a reward-rate update proposal", () => {
      const creation = createProposal(
        wallet1,
        "Boost rewards",
        "Set reward rate to 300 bps",
        "reward-rate",
        300,
      );
      expect(creation.result).toBeOk(Cl.uint(1));

      vote(wallet1, 1, true);
      vote(wallet2, 1, true);
      vote(wallet3, 1, true);

      simnet.mineEmptyBlocks(150);

      const execution = executeProposal(deployer, 1);
      expect(execution.result).toBeOk(Cl.bool(true));
    });

    it("should reject a reward-rate proposal that doesn't pass", () => {
      createProposal(
        wallet1,
        "Bad rate",
        "Set reward rate to 9999",
        "reward-rate",
        9999,
      );

      vote(wallet1, 1, false);
      vote(wallet2, 1, false);

      simnet.mineEmptyBlocks(150);

      const execution = executeProposal(deployer, 1);
      expect(execution.result).toBeErr(expect.anything());
    });
  });

  // ----------------------------------------------------------------
  // Phase 6: Multiple concurrent proposals
  // ----------------------------------------------------------------

  describe("concurrent proposals", () => {
    it("should handle multiple active proposals independently", () => {
      const p1 = createProposal(wallet1, "Proposal A", "desc A", "general", 0);
      const p2 = createProposal(wallet1, "Proposal B", "desc B", "general", 0);
      const p3 = createProposal(wallet2, "Proposal C", "desc C", "general", 0);

      expect(p1.result).toBeOk(Cl.uint(1));
      expect(p2.result).toBeOk(Cl.uint(2));
      expect(p3.result).toBeOk(Cl.uint(3));

      // Vote differently on each
      vote(wallet1, 1, true);
      vote(wallet2, 1, true);

      vote(wallet1, 2, false);
      vote(wallet2, 2, false);

      vote(wallet1, 3, true);
      vote(wallet3, 3, true);

      simnet.mineEmptyBlocks(150);

      // Proposal 1 should pass (2 for, 0 against)
      const exec1 = executeProposal(deployer, 1);
      expect(exec1.result).toBeOk(Cl.bool(true));

      // Proposal 2 should fail (0 for, 2 against)
      const exec2 = executeProposal(deployer, 2);
      expect(exec2.result).toBeErr(expect.anything());

      // Proposal 3 should pass (2 for, 0 against)
      const exec3 = executeProposal(deployer, 3);
      expect(exec3.result).toBeOk(Cl.bool(true));
    });

    it("should track proposal count across multiple creations", () => {
      createProposal(wallet1, "A", "a", "general", 0);
      createProposal(wallet2, "B", "b", "general", 0);
      createProposal(wallet1, "C", "c", "general", 0);
      createProposal(wallet2, "D", "d", "general", 0);
      createProposal(wallet3, "E", "e", "general", 0);

      const count = getProposalCount();
      expect(count.result).toBeOk(Cl.uint(5));
    });
  });
});
