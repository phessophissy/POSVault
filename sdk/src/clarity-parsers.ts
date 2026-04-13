import type {
  DepositRecord,
  UserStats,
  VaultInfo,
  Proposal,
  ProposalResult,
  VoteRecord,
  WithdrawResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Clarity JSON → Domain type parsers
// ---------------------------------------------------------------------------
// The Hiro API / cvToJSON returns plain objects with { type, value } shapes.
// These parsers convert that into our typed interfaces.

function extractClarityUint(cv: any): bigint {
  if (cv?.type === 'uint' || cv?.type === 'int') return BigInt(cv.value);
  if (typeof cv === 'bigint') return cv;
  if (typeof cv === 'number' || typeof cv === 'string') return BigInt(cv);
  throw new TypeError(`Cannot convert Clarity value to bigint: ${JSON.stringify(cv)}`);
}

function extractClarityBool(cv: any): boolean {
  if (cv?.type === 'bool') return cv.value;
  if (typeof cv === 'boolean') return cv;
  throw new TypeError(`Cannot convert Clarity value to boolean: ${JSON.stringify(cv)}`);
}

function extractClarityString(cv: any): string {
  if (cv?.type === 'string-ascii' || cv?.type === 'string-utf8') return cv.value;
  if (typeof cv === 'string') return cv;
  throw new TypeError(`Cannot convert Clarity value to string: ${JSON.stringify(cv)}`);
}

function extractClarityPrincipal(cv: any): string {
  if (cv?.type === 'principal') return cv.value;
  if (typeof cv === 'string') return cv;
  throw new TypeError(`Cannot convert Clarity value to principal: ${JSON.stringify(cv)}`);
}

/** Safely get a nested Clarity value field from a tuple result. */
function field(obj: any, key: string): any {
  // cvToJSON wraps tuples as { type: 'tuple', value: { fieldName: {...} } }
  if (obj?.type === 'tuple' && obj.value) return obj.value[key];
  if (obj?.value?.[key] !== undefined) return obj.value[key];
  return obj?.[key];
}

// ---------------------------------------------------------------------------
// Public parsers
// ---------------------------------------------------------------------------

export function parseDepositRecord(cv: unknown): DepositRecord {
  const obj = cv as any;
  return {
    amount: extractClarityUint(field(obj, 'amount')),
    depositBlock: extractClarityUint(field(obj, 'deposit-block')),
    lastClaimBlock: extractClarityUint(field(obj, 'last-claim-block')),
    totalRewardsClaimed: extractClarityUint(field(obj, 'total-rewards-claimed')),
  };
}

export function parseVaultInfo(cv: unknown): VaultInfo {
  const obj = cv as any;
  return {
    totalStxLocked: extractClarityUint(field(obj, 'total-stx-locked')),
    totalDepositors: extractClarityUint(field(obj, 'total-depositors')),
    rewardRate: extractClarityUint(field(obj, 'reward-rate')),
    isPaused: extractClarityBool(field(obj, 'is-paused')),
    currentBlock: extractClarityUint(field(obj, 'current-block')),
  };
}

export function parseUserStats(cv: unknown): UserStats {
  const obj = cv as any;
  return {
    totalDeposited: extractClarityUint(field(obj, 'total-deposited')),
    totalWithdrawn: extractClarityUint(field(obj, 'total-withdrawn')),
    totalRewards: extractClarityUint(field(obj, 'total-rewards')),
    depositCount: extractClarityUint(field(obj, 'deposit-count')),
  };
}

export function parseProposal(cv: unknown): Proposal {
  const obj = cv as any;
  return {
    proposer: extractClarityPrincipal(field(obj, 'proposer')),
    title: extractClarityString(field(obj, 'title')),
    description: extractClarityString(field(obj, 'description')),
    proposalType: extractClarityString(field(obj, 'proposal-type')),
    value: extractClarityUint(field(obj, 'value')),
    startBlock: extractClarityUint(field(obj, 'start-block')),
    endBlock: extractClarityUint(field(obj, 'end-block')),
    votesFor: extractClarityUint(field(obj, 'votes-for')),
    votesAgainst: extractClarityUint(field(obj, 'votes-against')),
    totalVoters: extractClarityUint(field(obj, 'total-voters')),
    executed: extractClarityBool(field(obj, 'executed')),
    passed: extractClarityBool(field(obj, 'passed')),
  };
}

export function parseProposalResult(cv: unknown): ProposalResult {
  const obj = cv as any;
  return {
    passed: extractClarityBool(field(obj, 'passed')),
    votesFor: extractClarityUint(field(obj, 'votes-for')),
    votesAgainst: extractClarityUint(field(obj, 'votes-against')),
    totalVoters: extractClarityUint(field(obj, 'total-voters')),
    executed: extractClarityBool(field(obj, 'executed')),
    votingEnded: extractClarityBool(field(obj, 'voting-ended')),
  };
}

export function parseVoteRecord(cv: unknown): VoteRecord {
  const obj = cv as any;
  return {
    amount: extractClarityUint(field(obj, 'amount')),
    support: extractClarityBool(field(obj, 'support')),
  };
}

export function parseWithdrawResult(cv: unknown): WithdrawResult {
  const obj = cv as any;
  return {
    stxReturned: extractClarityUint(field(obj, 'stx-returned')),
    rewardsEarned: extractClarityUint(field(obj, 'rewards-earned')),
  };
}
