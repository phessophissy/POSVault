/**
 * Input validation for SDK functions.
 */

import { ConfigurationError } from './errors.js';
import { DEPLOYER } from './constants.js';

export function validateAddress(address: string, label = 'address'): void {
  if (!address || typeof address !== 'string') {
    throw new ConfigurationError(`${label} is required`);
  }
  if (!/^S[PM][A-Z0-9]{38,40}$/.test(address)) {
    throw new ConfigurationError(`Invalid Stacks ${label}: ${address}`);
  }
}

export function validateAmount(amount: number | bigint, label = 'amount'): void {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  if (value <= 0n) {
    throw new ConfigurationError(`${label} must be greater than 0`);
  }
}

export function validateProposalId(id: number | bigint): void {
  const value = typeof id === 'bigint' ? id : BigInt(id);
  if (value <= 0n) {
    throw new ConfigurationError('Proposal ID must be a positive integer');
  }
}

export function validateNetwork(network?: string): 'mainnet' | 'testnet' {
  if (!network) return 'mainnet';
  if (network !== 'mainnet' && network !== 'testnet') {
    throw new ConfigurationError(`Invalid network: ${network}. Use 'mainnet' or 'testnet'`);
  }
  return network;
}

export function validateConfig(config: { deployer?: string; network?: string }): void {
  if (config.deployer) validateAddress(config.deployer, 'deployer');
  if (config.network) validateNetwork(config.network);
}

export function validatePrivateKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new ConfigurationError('Private key is required for server-side operations');
  }
  if (!/^[0-9a-fA-F]{64,66}$/.test(key)) {
    throw new ConfigurationError('Invalid private key format');
  }
}
