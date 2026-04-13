import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['sdk/src/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'frontend'],
    environment: 'node',
    globals: false,
    testTimeout: 10_000,
    pool: 'threads',
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: ['sdk/src/**/*.ts'],
      exclude: ['sdk/src/__tests__/**', 'sdk/src/index.ts'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
});
