import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const contract = "vault-core-v4";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

describe("vault edge cases", () => {
  it("handles minimum deposit amount (1 microSTX)", () => {
    const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(1)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("handles large deposit amount", () => {
    const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(100_000_000_000)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("immediate withdraw after deposit", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(1_000_000)], user1);
    const result = simnet.callPublicFn(contract, "withdraw", [], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("claim with zero elapsed blocks", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(1_000_000)], user1);
    const result = simnet.callPublicFn(contract, "claim-rewards", [], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("deposit-withdraw-redeposit cycle", () => {
    simnet.callPublicFn(contract, "deposit", [Cl.uint(1_000_000)], user1);
    simnet.callPublicFn(contract, "withdraw", [], user1);
    const result = simnet.callPublicFn(contract, "deposit", [Cl.uint(2_000_000)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
