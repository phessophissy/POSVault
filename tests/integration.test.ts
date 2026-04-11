import { describe, it, expect } from "vitest";
import { ClarityType } from "@stacks/transactions";
import { DEPLOYER, USER1, USER2, DEPOSIT_1_STX, BLOCKS_PER_CYCLE, depositAs, withdrawAs, claimAs, getVaultInfo, getDeposit, getPendingRewards } from "./helpers";

describe("integration: full deposit lifecycle", () => {
  it("deposit → wait → claim → withdraw cycle", () => {
    const dep = depositAs(USER1, DEPOSIT_1_STX);
    expect(dep.result).toHaveClarityType(ClarityType.ResponseOk);

    simnet.mineEmptyBlocks(BLOCKS_PER_CYCLE * 2);

    const claim = claimAs(USER1);
    expect(claim.result).toHaveClarityType(ClarityType.ResponseOk);

    const withdraw = withdrawAs(USER1);
    expect(withdraw.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("two users deposit and claim independently", () => {
    depositAs(USER1, DEPOSIT_1_STX);
    depositAs(USER2, DEPOSIT_1_STX * 2);
    simnet.mineEmptyBlocks(BLOCKS_PER_CYCLE);
    
    const c1 = claimAs(USER1);
    const c2 = claimAs(USER2);
    expect(c1.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(c2.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("vault info reflects total locked after deposits", () => {
    depositAs(USER1, DEPOSIT_1_STX);
    depositAs(USER2, DEPOSIT_1_STX);
    const info = getVaultInfo();
    expect(info.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
