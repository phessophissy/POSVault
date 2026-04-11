/**
 * Configuration management for the POSVault SDK.
 */

import { DEPLOYER, CONTRACT_NAMES } from './constants.js';
import type { POSVaultConfig, ContractNames } from './types.js';

interface ResolvedConfig {
  deployer: string;
  network: 'mainnet' | 'testnet';
  contractNames: ContractNames;
  apiBaseUrl: string;
}

const API_URLS = {
  mainnet: 'https://api.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
} as const;

export function resolveConfig(config?: POSVaultConfig): ResolvedConfig {
  const network = config?.network || 'mainnet';
  return {
    deployer: config?.deployer || DEPLOYER,
    network,
    contractNames: {
      ...CONTRACT_NAMES,
      ...config?.contractNames,
    },
    apiBaseUrl: API_URLS[network],
  };
}

export function getContractIdentifier(
  contractName: string,
  config?: POSVaultConfig
): string {
  const resolved = resolveConfig(config);
  return `${resolved.deployer}.${contractName}`;
}

export function getVaultCoreId(config?: POSVaultConfig): string {
  const resolved = resolveConfig(config);
  return `${resolved.deployer}.${resolved.contractNames.vaultCore}`;
}

export function getTokenId(config?: POSVaultConfig): string {
  const resolved = resolveConfig(config);
  return `${resolved.deployer}.${resolved.contractNames.governanceToken}`;
}

export function getVotingId(config?: POSVaultConfig): string {
  const resolved = resolveConfig(config);
  return `${resolved.deployer}.${resolved.contractNames.proposalVoting}`;
}
