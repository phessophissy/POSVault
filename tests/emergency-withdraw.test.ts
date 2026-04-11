import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const contract = "vault-core-v4";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

describe("emergency withdraw", () => {
  it("owner can emergency withdraw", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(5_000_000)], user1);
    const result = simnet.callPublicFn(contract, "emergency-withdraw", [], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("non-owner cannot emergency withdraw", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(5_000_000)], user1);
    const result = simnet.callPublicFn(contract, "emergency-withdraw", [], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });
});
