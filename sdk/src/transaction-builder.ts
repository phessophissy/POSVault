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

export interface TransactionResult {
  plan: TransactionPlan;
  txids: string[];
  success: boolean;
  errors: string[];
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

  validate(): string[] {
    const errors: string[] = [];
    if (this.steps.length === 0) {
      errors.push('No steps defined');
    }
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (!step.functionName) {
        errors.push(`Step ${i}: missing function name`);
      }
      if (!step.contract) {
        errors.push(`Step ${i}: missing contract key`);
      }
    }
    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
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

// ---------------------------------------------------------------------------
// Governance builders
// ---------------------------------------------------------------------------

export function buildCreateProposal(
  title: string,
  description: string,
  proposalType: string,
  value: bigint,
  config?: POSVaultConfig,
): TransactionPlan {
  const { stringAsciiCV, uintCV } = require('@stacks/transactions');
  const builder = new TransactionBuilder(config);
  return builder
    .describe(`Create proposal: ${title}`)
    .addStep({
      contract: 'proposalVoting',
      functionName: 'create-proposal',
      args: [
        stringAsciiCV(title),
        stringAsciiCV(description),
        stringAsciiCV(proposalType),
        uintCV(value),
      ],
    })
    .build();
}

export function buildVote(
  proposalId: bigint,
  voteFor: boolean,
  config?: POSVaultConfig,
): TransactionPlan {
  const { uintCV, boolCV } = require('@stacks/transactions');
  const builder = new TransactionBuilder(config);
  return builder
    .describe(`Vote ${voteFor ? 'FOR' : 'AGAINST'} proposal #${proposalId}`)
    .addStep({
      contract: 'proposalVoting',
      functionName: 'vote',
      args: [uintCV(proposalId), boolCV(voteFor)],
    })
    .build();
}

export function buildExecuteProposal(
  proposalId: bigint,
  config?: POSVaultConfig,
): TransactionPlan {
  const { uintCV } = require('@stacks/transactions');
  const builder = new TransactionBuilder(config);
  return builder
    .describe(`Execute proposal #${proposalId}`)
    .addStep({
      contract: 'proposalVoting',
      functionName: 'execute-proposal',
      args: [uintCV(proposalId)],
    })
    .build();
}
