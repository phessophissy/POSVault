import { ValidationError } from './errors.js';
import { DEPLOYER } from './constants.js';

export function validateAddress(address: string): void {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('Address must be a non-empty string');
  }
  if (!address.startsWith('SP') && !address.startsWith('ST')) {
    throw new ValidationError(`Invalid Stacks address format: ${address}`);
  }
  if (address.length < 30 || address.length > 42) {
    throw new ValidationError(`Invalid address length: ${address.length}`);
  }
}

export function validateAmount(amount: number | bigint): void {
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  if (value <= 0n) {
    throw new ValidationError('Amount must be greater than zero');
  }
  if (value > 1_000_000_000_000n) {
    throw new ValidationError('Amount exceeds maximum allowed (1M STX)');
  }
}

export function validateProposalId(id: number | bigint): void {
  const value = typeof id === 'bigint' ? id : BigInt(id);
  if (value <= 0n) {
    throw new ValidationError('Proposal ID must be a positive integer');
  }
}

export function validateRewardRate(rate: number): void {
  if (!Number.isInteger(rate) || rate < 0 || rate > 10000) {
    throw new ValidationError('Reward rate must be 0-10000 basis points');
  }
}

export function validateNetwork(network: string): void {
  if (network !== 'mainnet' && network !== 'testnet') {
    throw new ValidationError(`Invalid network: ${network}. Use 'mainnet' or 'testnet'`);
  }
}

export function validatePrivateKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new ValidationError('Private key must be a non-empty string');
  }
  if (!/^[0-9a-fA-F]{64,66}$/.test(key)) {
    throw new ValidationError('Invalid private key format');
  }
}
