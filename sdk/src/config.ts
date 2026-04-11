import type { POSVaultConfig, ContractNames } from './types.js';
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface ResolvedConfig {
  deployer: string;
  network: 'mainnet' | 'testnet';
  contractNames: ContractNames;
  apiBaseUrl: string;
}

export function resolveConfig(config?: POSVaultConfig): ResolvedConfig {
  const network = config?.network ?? 'mainnet';
  const deployer = config?.deployer ?? DEPLOYER;
  const contractNames: ContractNames = {
    vaultCore: config?.contractNames?.vaultCore ?? CONTRACT_NAMES.vaultCore,
    governanceToken: config?.contractNames?.governanceToken ?? CONTRACT_NAMES.governanceToken,
    proposalVoting: config?.contractNames?.proposalVoting ?? CONTRACT_NAMES.proposalVoting,
  };
  const apiBaseUrl = network === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so';

  return { deployer, network, contractNames, apiBaseUrl };
}

export function getContractId(config: ResolvedConfig, contractKey: keyof ContractNames): string {
  return `${config.deployer}.${config.contractNames[contractKey]}`;
}
