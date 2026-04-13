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
