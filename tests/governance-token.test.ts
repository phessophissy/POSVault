import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("governance-token", () => {
  // ==========================================
  // Token Metadata
  // ==========================================

  it("should return the correct token name", () => {
    const result = simnet.callReadOnlyFn(
      "governance-token",
      "get-name",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.stringAscii("POSVault Governance Token"));
  });

  it("should return the correct token symbol", () => {
    const result = simnet.callReadOnlyFn(
      "governance-token",
      "get-symbol",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.stringAscii("POS-GOV"));
  });

  it("should return 6 decimals", () => {
    const result = simnet.callReadOnlyFn(
      "governance-token",
      "get-decimals",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.uint(6));
  });

  // ==========================================
  // Minting
  // ==========================================

  it("should allow owner to mint tokens", () => {
    const result = simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(1000000), Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should update balance after minting", () => {
    simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(5000000), Cl.principal(wallet1)],
      deployer
    );

    const balance = simnet.callReadOnlyFn(
      "governance-token",
      "get-balance",
      [Cl.principal(wallet1)],
      deployer
    );
    expect(balance.result).toBeOk(Cl.uint(5000000));
  });

  it("should prevent non-owner from minting", () => {
    const result = simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(1000000), Cl.principal(wallet2)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  it("should allow authorized minter to mint", () => {
    // Add wallet1 as minter
    simnet.callPublicFn(
      "governance-token",
      "add-minter",
      [Cl.principal(wallet1)],
      deployer
    );

    // Wallet1 should now be able to mint
    const result = simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(500000), Cl.principal(wallet2)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  // ==========================================
  // Transfers
  // ==========================================

  it("should allow token transfers", () => {
    // Mint tokens to wallet1
    simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(2000000), Cl.principal(wallet1)],
      deployer
    );

    // Transfer from wallet1 to wallet2
    const result = simnet.callPublicFn(
      "governance-token",
      "transfer",
      [Cl.uint(1000000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should prevent unauthorized transfers", () => {
    simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(2000000), Cl.principal(wallet1)],
      deployer
    );

    // wallet2 tries to transfer wallet1's tokens
    const result = simnet.callPublicFn(
      "governance-token",
      "transfer",
      [Cl.uint(1000000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet2
    );
    expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  // ==========================================
  // Burning
  // ==========================================

  it("should allow burning tokens", () => {
    simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(2000000), Cl.principal(wallet1)],
      deployer
    );

    const result = simnet.callPublicFn(
      "governance-token",
      "burn",
      [Cl.uint(1000000)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  // ==========================================
  // Admin Functions
  // ==========================================

  it("should toggle minting", () => {
    const result = simnet.callPublicFn(
      "governance-token",
      "toggle-minting",
      [],
      deployer
    );
    expect(result.result).toBeOk(Cl.bool(true));

    // Minting should now fail
    const mintResult = simnet.callPublicFn(
      "governance-token",
      "mint",
      [Cl.uint(1000000), Cl.principal(wallet1)],
      deployer
    );
    expect(mintResult.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED (minting disabled)
  });
});
