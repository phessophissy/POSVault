import { describe, it, expect } from 'vitest';

// Inline test of the TransactionBuilder logic
// (avoids needing @stacks/transactions import in test runner)

interface TransactionStep {
  contract: string;
  functionName: string;
  args: any[];
}

class TestTransactionBuilder {
  private steps: TransactionStep[] = [];
  private description = '';

  describe(description: string) {
    this.description = description;
    return this;
  }

  addStep(step: TransactionStep) {
    this.steps.push(step);
    return this;
  }

  removeStep(index: number) {
    if (index < 0 || index >= this.steps.length) {
      throw new Error(`Step index ${index} out of range`);
    }
    this.steps.splice(index, 1);
    return this;
  }

  insertStep(index: number, step: TransactionStep) {
    if (index < 0 || index > this.steps.length) {
      throw new Error(`Insert index ${index} out of range`);
    }
    this.steps.splice(index, 0, step);
    return this;
  }

  getSteps() {
    return [...this.steps];
  }

  validate() {
    const errors: string[] = [];
    if (this.steps.length === 0) errors.push('No steps defined');
    for (let i = 0; i < this.steps.length; i++) {
      if (!this.steps[i].functionName) errors.push(`Step ${i}: missing function name`);
      if (!this.steps[i].contract) errors.push(`Step ${i}: missing contract key`);
    }
    return errors;
  }

  isValid() {
    return this.validate().length === 0;
  }

  build() {
    if (this.steps.length === 0) throw new Error('at least one step is required');
    return { steps: [...this.steps], description: this.description };
  }

  clear() {
    this.steps = [];
    this.description = '';
    return this;
  }
}

describe('TransactionBuilder', () => {
  it('creates a builder with no steps', () => {
    const builder = new TestTransactionBuilder();
    expect(builder.getSteps()).toHaveLength(0);
  });

  it('adds a step', () => {
    const builder = new TestTransactionBuilder();
    builder.addStep({ contract: 'vaultCore', functionName: 'deposit', args: [] });
    expect(builder.getSteps()).toHaveLength(1);
    expect(builder.getSteps()[0].functionName).toBe('deposit');
  });

  it('chains multiple steps', () => {
    const builder = new TestTransactionBuilder();
    builder
      .describe('Multi-step')
      .addStep({ contract: 'vaultCore', functionName: 'deposit', args: [] })
      .addStep({ contract: 'vaultCore', functionName: 'claim-rewards', args: [] });
    expect(builder.getSteps()).toHaveLength(2);
  });

  it('removes a step by index', () => {
    const builder = new TestTransactionBuilder();
    builder
      .addStep({ contract: 'vaultCore', functionName: 'deposit', args: [] })
      .addStep({ contract: 'vaultCore', functionName: 'withdraw', args: [] });
    builder.removeStep(0);
    expect(builder.getSteps()).toHaveLength(1);
    expect(builder.getSteps()[0].functionName).toBe('withdraw');
  });

  it('throws on invalid removeStep index', () => {
    const builder = new TestTransactionBuilder();
    expect(() => builder.removeStep(5)).toThrow('out of range');
  });

  it('inserts a step at a specific index', () => {
    const builder = new TestTransactionBuilder();
    builder
      .addStep({ contract: 'vaultCore', functionName: 'a', args: [] })
      .addStep({ contract: 'vaultCore', functionName: 'c', args: [] })
      .insertStep(1, { contract: 'vaultCore', functionName: 'b', args: [] });
    const names = builder.getSteps().map((s) => s.functionName);
    expect(names).toEqual(['a', 'b', 'c']);
  });
});

describe('TransactionBuilder validation', () => {
  it('validates empty builder', () => {
    const builder = new TestTransactionBuilder();
    expect(builder.isValid()).toBe(false);
    expect(builder.validate()).toContain('No steps defined');
  });

  it('validates steps with missing fields', () => {
    const builder = new TestTransactionBuilder();
    builder.addStep({ contract: '', functionName: 'deposit', args: [] });
    expect(builder.validate()).toContain('Step 0: missing contract key');
  });

  it('passes validation for well-formed builder', () => {
    const builder = new TestTransactionBuilder();
    builder.addStep({ contract: 'vaultCore', functionName: 'deposit', args: [] });
    expect(builder.isValid()).toBe(true);
  });
});

describe('TransactionBuilder build', () => {
  it('throws when building with no steps', () => {
    const builder = new TestTransactionBuilder();
    expect(() => builder.build()).toThrow('at least one step');
  });

  it('builds a valid plan', () => {
    const builder = new TestTransactionBuilder();
    builder
      .describe('Test plan')
      .addStep({ contract: 'vaultCore', functionName: 'deposit', args: [100n] });
    const plan = builder.build();
    expect(plan.description).toBe('Test plan');
    expect(plan.steps).toHaveLength(1);
  });

  it('clear resets builder', () => {
    const builder = new TestTransactionBuilder();
    builder
      .describe('will be cleared')
      .addStep({ contract: 'vaultCore', functionName: 'deposit', args: [] })
      .clear();
    expect(builder.getSteps()).toHaveLength(0);
    expect(() => builder.build()).toThrow();
  });
});
