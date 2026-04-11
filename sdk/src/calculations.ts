/**
 * Reward and financial calculations.
 */

import { TOKEN_DECIMALS, REWARD_CYCLE_LENGTH } from './constants.js';

/**
 * Calculate estimated rewards for a deposit over a given number of blocks.
 */
export function estimateRewards(
  depositAmount: bigint,
  rewardRate: bigint,
  blocksElapsed: bigint
): bigint {
  if (depositAmount <= 0n || rewardRate <= 0n || blocksElapsed <= 0n) {
    return 0n;
  }

  const cyclesElapsed = blocksElapsed / BigInt(REWARD_CYCLE_LENGTH);
  const rewardPerCycle = (depositAmount * rewardRate) / 10000n;
  return cyclesElapsed * rewardPerCycle;
}

/**
 * Calculate APY based on reward rate (in basis points per cycle).
 */
export function calculateAPY(rewardRate: bigint): number {
  const ratePerCycle = Number(rewardRate) / 10000;
  const cyclesPerYear = (365 * 24 * 6) / 144; // ~6 blocks/hour, 144 blocks/cycle
  return (Math.pow(1 + ratePerCycle, cyclesPerYear) - 1) * 100;
}

/**
 * Calculate time until next reward cycle.
 */
export function blocksUntilNextCycle(
  depositBlock: bigint,
  currentBlock: bigint
): bigint {
  const blocksInVault = currentBlock - depositBlock;
  const remainder = blocksInVault % BigInt(REWARD_CYCLE_LENGTH);
  return BigInt(REWARD_CYCLE_LENGTH) - remainder;
}

/**
 * Format a micro-unit amount to human-readable with token decimals.
 */
export function toTokenAmount(microAmount: bigint): number {
  return Number(microAmount) / Math.pow(10, TOKEN_DECIMALS);
}

/**
 * Convert a human-readable token amount to micro-units.
 */
export function toMicroAmount(amount: number): bigint {
  return BigInt(Math.round(amount * Math.pow(10, TOKEN_DECIMALS)));
}
