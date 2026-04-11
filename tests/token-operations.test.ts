import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
import { DEPLOYER, USER1, USER2, CONTRACTS } from "./helpers";

describe("governance-token operations", () => {
  it("get-name returns token name", () => {
    const result = simnet.callReadOnlyFn(CONTRACTS.governanceToken, "get-name", [], DEPLOYER);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-symbol returns POS-GOV", () => {
    const result = simnet.callReadOnlyFn(CONTRACTS.governanceToken, "get-symbol", [], DEPLOYER);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-decimals returns 6", () => {
    const result = simnet.callReadOnlyFn(CONTRACTS.governanceToken, "get-decimals", [], DEPLOYER);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-total-supply returns current supply", () => {
    const result = simnet.callReadOnlyFn(CONTRACTS.governanceToken, "get-total-supply", [], DEPLOYER);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("get-balance returns zero for new user", () => {
    const result = simnet.callReadOnlyFn(CONTRACTS.governanceToken, "get-balance", [Cl.principal(USER2)], DEPLOYER);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("owner can add minter", () => {
    const result = simnet.callPublicFn(CONTRACTS.governanceToken, "add-authorized-minter", [Cl.principal(USER1)], DEPLOYER);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("non-owner cannot add minter", () => {
    const result = simnet.callPublicFn(CONTRACTS.governanceToken, "add-authorized-minter", [Cl.principal(USER2)], USER1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });
});
