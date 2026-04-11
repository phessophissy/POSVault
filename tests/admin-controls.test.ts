import { describe, it, expect } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const contract = "vault-core-v4";
const user1 = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

describe("admin controls", () => {
  it("add-admin grants privileges", () => {
    const result = simnet.callPublicFn(contract, "add-admin", [Cl.principal(user1)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("remove-admin revokes privileges", () => {
    simnet.callPublicFn(contract, "add-admin", [Cl.principal(user1)], deployer);
    const result = simnet.callPublicFn(contract, "remove-admin", [Cl.principal(user1)], deployer);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("admin can toggle pause", () => {
    simnet.callPublicFn(contract, "add-admin", [Cl.principal(user1)], deployer);
    const result = simnet.callPublicFn(contract, "toggle-pause", [], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("admin can set reward rate", () => {
    simnet.callPublicFn(contract, "add-admin", [Cl.principal(user1)], deployer);
    const result = simnet.callPublicFn(contract, "set-reward-rate", [Cl.uint(150)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("non-admin cannot set reward rate", () => {
    const result = simnet.callPublicFn(contract, "set-reward-rate", [Cl.uint(150)], user1);
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });
});
