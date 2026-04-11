export interface POSVaultConfig {
  deployer?: string;
  network?: 'mainnet' | 'testnet';
  contractNames?: Partial<ContractNames>;
}

export interface ContractNames {
  vaultCore: string;
  governanceToken: string;
  proposalVoting: string;
}

export interface DepositRecord {
  amount: bigint;
  depositBlock: bigint;
  lastClaimBlock: bigint;
  totalRewardsClaimed: bigint;
}

export interface UserStats {
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  totalRewards: bigint;
  depositCount: bigint;
}

export interface VaultInfo {
  totalStxLocked: bigint;
  totalDepositors: bigint;
  rewardRate: bigint;
  isPaused: boolean;
  currentBlock: bigint;
}

export interface WithdrawResult {
  stxReturned: bigint;
  rewardsEarned: bigint;
}

export interface Proposal {
  proposer: string;
  title: string;
  description: string;
  proposalType: string;
  value: bigint;
  startBlock: bigint;
  endBlock: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  totalVoters: bigint;
  executed: boolean;
  passed: boolean;
}

export interface ProposalResult {
  passed: boolean;
  votesFor: bigint;
  votesAgainst: bigint;
  totalVoters: bigint;
  executed: boolean;
  votingEnded: boolean;
}

export interface VoteRecord {
  amount: bigint;
  support: boolean;
}

export interface TxResult {
  txid: string;
}

export interface ContractCallParams {
  onFinish?: (data: TxResult) => void;
  onCancel?: () => void;
}

/** Extended type for Analytics Data - variation 1 */
export interface Extended10_1 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}

/** Extended type for Analytics Data - variation 2 */
export interface Extended10_2 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}

/** Extended type for Analytics Data - variation 3 */
export interface Extended10_3 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}

/** Extended type for Analytics Data - variation 4 */
export interface Extended10_4 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}

/** Extended type for Analytics Data - variation 5 */
export interface Extended10_5 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}

/** Extended type for Analytics Data - variation 6 */
export interface Extended10_6 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}

/** Extended type for Analytics Data - variation 7 */
export interface Extended10_7 {
  id: bigint;
  label: string;
  value: bigint;
  active: boolean;
  timestamp: bigint;
  metadata: Record<string, string>;
}
