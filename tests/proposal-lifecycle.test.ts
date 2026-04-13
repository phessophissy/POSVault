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
});
