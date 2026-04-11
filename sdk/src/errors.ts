/**
 * Custom error classes for the POSVault SDK.
 */

export class POSVaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'POSVaultError';
  }
}

export class ContractCallError extends POSVaultError {
  public readonly code: number;
  public readonly contractName: string;
  public readonly functionName: string;

  constructor(code: number, contractName: string, functionName: string) {
    super(`Contract call failed: ${contractName}.${functionName} returned error u${code}`);
    this.name = 'ContractCallError';
    this.code = code;
    this.contractName = contractName;
    this.functionName = functionName;
  }
}

export class NetworkError extends POSVaultError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(`Network error: ${message}`);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

export class ConfigurationError extends POSVaultError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationError';
  }
}

export class InsufficientBalanceError extends POSVaultError {
  public readonly required: bigint;
  public readonly available: bigint;

  constructor(required: bigint, available: bigint) {
    super(`Insufficient balance: required ${required}, available ${available}`);
    this.name = 'InsufficientBalanceError';
    this.required = required;
    this.available = available;
  }
}

export const ERROR_CODES: Record<number, string> = {
  100: 'ERR-NOT-AUTHORIZED (token)',
  101: 'ERR-INSUFFICIENT-BALANCE (token)',
  102: 'ERR-INVALID-AMOUNT (token)',
  200: 'ERR-NOT-AUTHORIZED (vault)',
  202: 'ERR-INSUFFICIENT-BALANCE (vault)',
  203: 'ERR-INVALID-AMOUNT (vault)',
  205: 'ERR-ALREADY-DEPOSITED',
  206: 'ERR-NO-DEPOSIT',
  207: 'ERR-VAULT-PAUSED',
  300: 'ERR-NOT-AUTHORIZED (voting)',
  301: 'ERR-PROPOSAL-NOT-FOUND',
  302: 'ERR-ALREADY-VOTED',
  303: 'ERR-VOTING-ENDED',
  304: 'ERR-VOTING-NOT-ENDED',
  305: 'ERR-PROPOSAL-EXECUTED',
  306: 'ERR-INSUFFICIENT-TOKENS',
  307: 'ERR-QUORUM-NOT-MET',
  308: 'ERR-INVALID-PROPOSAL',
  309: 'ERR-VOTING-ACTIVE',
};

export function getErrorMessage(code: number): string {
  return ERROR_CODES[code] || `Unknown error (u${code})`;
}
