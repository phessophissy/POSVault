import type { ClarityValue } from '@stacks/transactions';
import type { ContractNames, POSVaultConfig } from './types.js';
import { resolveConfig, getContractId } from './config.js';

export interface TransactionStep {
  contract: keyof ContractNames;
  functionName: string;
  args: ClarityValue[];
  postConditions?: any[];
}

export interface TransactionPlan {
  steps: TransactionStep[];
  description: string;
  estimatedFee?: number;
}

export class TransactionBuilder {
  private steps: TransactionStep[] = [];
  private description = '';
  private config: ReturnType<typeof resolveConfig>;

  constructor(config?: POSVaultConfig) {
    this.config = resolveConfig(config);
  }

  describe(description: string): this {
    this.description = description;
    return this;
  }

  addStep(step: TransactionStep): this {
    this.steps.push(step);
    return this;
  }

  getSteps(): ReadonlyArray<TransactionStep> {
    return [...this.steps];
  }

  getDescription(): string {
    return this.description;
  }

  getConfig() {
    return this.config;
  }

  build(): TransactionPlan {
    if (this.steps.length === 0) {
      throw new Error('TransactionBuilder: at least one step is required');
    }
    return {
      steps: [...this.steps],
      description: this.description,
    };
  }

  clear(): this {
    this.steps = [];
    this.description = '';
    return this;
  }
}

// ---------------------------------------------------------------------------
// Deposit builder
// ---------------------------------------------------------------------------

export function buildDeposit(amountMicroSTX: bigint, config?: POSVaultConfig): TransactionPlan {
  const { uintCV } = require('@stacks/transactions');
  const builder = new TransactionBuilder(config);
  return builder
    .describe(`Deposit ${amountMicroSTX} µSTX into POSVault`)
    .addStep({
      contract: 'vaultCore',
      functionName: 'deposit',
      args: [uintCV(amountMicroSTX)],
    })
    .build();
}

// ---------------------------------------------------------------------------
// Withdraw builder
// ---------------------------------------------------------------------------

export function buildWithdraw(config?: POSVaultConfig): TransactionPlan {
  const builder = new TransactionBuilder(config);
  return builder
    .describe('Withdraw STX from POSVault and claim pending rewards')
    .addStep({
      contract: 'vaultCore',
      functionName: 'withdraw',
      args: [],
    })
    .build();
}

// ---------------------------------------------------------------------------
// Claim rewards builder
// ---------------------------------------------------------------------------

export function buildClaimRewards(config?: POSVaultConfig): TransactionPlan {
  const builder = new TransactionBuilder(config);
  return builder
    .describe('Claim pending POS-GOV rewards')
    .addStep({
      contract: 'vaultCore',
      functionName: 'claim-rewards',
      args: [],
    })
    .build();
}
