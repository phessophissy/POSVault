import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const vault = "vault-core-v4";
const govToken = "governance-token";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const user2 = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

describe("Vault stress test scenarios — scenario 9", () => {
  it("verifies vault state for scenario 9", () => {
    const info = simnet.callReadOnlyFn(vault, "get-vault-info", [], deployer);
    expect(info.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("checks deposit for scenario 9", () => {
    const r = simnet.callPublicFn(vault, "deposit", [Cl.uint(900000)], user1);
    expect(r.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("validates token info for scenario 9", () => {
    const name = simnet.callReadOnlyFn(govToken, "get-name", [], deployer);
    expect(name.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
