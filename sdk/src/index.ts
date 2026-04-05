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
