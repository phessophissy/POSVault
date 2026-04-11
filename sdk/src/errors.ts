export class POSVaultError extends Error {
  constructor(message: string, public readonly code?: number) {
    super(message);
    this.name = 'POSVaultError';
  }
}

export class ContractCallError extends POSVaultError {
  constructor(
    public readonly functionName: string,
    public readonly contractName: string,
    message: string,
    code?: number,
  ) {
    super(`${contractName}.${functionName}: ${message}`, code);
    this.name = 'ContractCallError';
  }
}

export class NetworkError extends POSVaultError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends POSVaultError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const ERROR_CODES: Record<number, string> = {
  200: 'ERR-NOT-AUTHORIZED',
  202: 'ERR-INSUFFICIENT-BALANCE',
  203: 'ERR-INVALID-AMOUNT',
  205: 'ERR-ALREADY-DEPOSITED',
  206: 'ERR-NO-DEPOSIT',
  207: 'ERR-VAULT-PAUSED',
};

export function decodeContractError(errorCode: number): string {
  return ERROR_CODES[errorCode] ?? `UNKNOWN-ERROR-${errorCode}`;
}
