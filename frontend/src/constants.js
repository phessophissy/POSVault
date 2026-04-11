/**
 * Frontend constants for POSVault dApp.
 */

export const DEPLOYER = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';

export const CONTRACTS = {
  VAULT_CORE: 'vault-core-v4',
  GOVERNANCE_TOKEN: 'governance-token',
  PROPOSAL_VOTING: 'proposal-voting',
};

export const TOKEN_INFO = {
  name: 'POSVault Governance',
  symbol: 'POS-GOV',
  decimals: 6,
  maxSupply: 100_000_000,
};

export const VAULT_CONFIG = {
  blocksPerCycle: 144,
  votingPeriod: 1008,
  minDeposit: 1000,
  maxDeposit: 100_000_000_000_000,
};

export const PROPOSAL_TYPES = {
  general: { label: 'General', color: '#6366f1' },
  'reward-rate': { label: 'Reward Rate', color: '#f59e0b' },
  pause: { label: 'Pause', color: '#ef4444' },
};

export const EXPLORER_BASE = 'https://explorer.hiro.so';
export const API_BASE = 'https://api.hiro.so';
export const REFRESH_INTERVAL = 30_000;
