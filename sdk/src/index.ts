// Constants
export { DEPLOYER, CONTRACT_NAMES, REWARD_CYCLE_LENGTH, VOTING_PERIOD, TOKEN_DECIMALS, TOKEN_SYMBOL, MAX_SUPPLY } from './constants.js';

// Types
export type {
  POSVaultConfig,
  ContractNames,
  DepositRecord,
  UserStats,
  VaultInfo,
  WithdrawResult,
  Proposal,
  ProposalResult,
  VoteRecord,
  TxResult,
  ContractCallParams,
} from './types.js';

// Read-only queries (works in both browser and server)
export {
  callReadOnly,
  getVaultInfo,
  getDeposit,
  getUserStats,
  getPendingRewards,
  getRewardRate,
  isPaused,
  getTokenBalance,
  getTotalSupply,
  getTotalMinted,
  isMinter,
  getMintingStatus,
  getProposal,
  getProposalCount,
  getProposalResult,
  getVoteRecord,
  isVotingActive,
  getUserActiveProposal,
} from './read-only.js';
export type { ReadOnlyOptions } from './read-only.js';

// Server-side operations (private key signing)
export {
  deposit,
  withdraw,
  claimRewards,
  setRewardRate,
  togglePause,
  addAdmin,
  removeAdmin,
  emergencyWithdraw,
  transferToken,
  burnToken,
  addMinter,
  removeMinter,
  toggleMinting,
  createProposal,
  vote,
  executeProposal,
  sendSTX,
} from './server.js';
export type { ServerCallOptions } from './server.js';

// Browser operations (wallet popup signing)
export {
  connectWallet,
  disconnectWallet,
  depositSTX,
  withdrawSTX,
  claimRewards as claimRewardsBrowser,
  createProposal as createProposalBrowser,
  voteOnProposal,
  executeProposal as executeProposalBrowser,
} from './browser.js';
export type { BrowserOptions, ContractCallCallbacks } from './browser.js';

// Utilities
export { stxToMicro, microToStx, formatAddress, formatNumber, explorerUrl } from './utils.js';

// Error classes
export {
  POSVaultError,
  ContractCallError,
  NetworkError,
  ConfigurationError,
  InsufficientBalanceError,
  ERROR_CODES,
  getErrorMessage,
} from './errors.js';

// Validation
export { validateAddress, validateAmount, validateProposalId, validateNetwork, validateConfig } from './validation.js';

// Configuration
export { resolveConfig, getContractIdentifier, getVaultCoreId, getTokenId, getVotingId } from './config.js';

// Calculations
export { estimateRewards, calculateAPY, blocksUntilNextCycle, toTokenAmount, toMicroAmount } from './calculations.js';

// Events
export type { TransactionEvent, TransactionEventType, DepositEvent, WithdrawEvent, VoteEvent } from './events.js';
export { createTransactionEvent, isDepositEvent, isWithdrawEvent, isVoteEvent } from './events.js';

// Retry
export type { RetryOptions } from './retry.js';
export { withRetry } from './retry.js';

// Parsers
export { parseVaultInfo, parseDeposit, parseUserStats, parseProposal, parseProposalResult, parseVoteRecord } from './parsers.js';

// Version
export { SDK_VERSION, SDK_NAME } from './version.js';
