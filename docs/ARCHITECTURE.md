# Architecture Overview

This document provides a high-level overview of the POSVault system
architecture.

## System Components

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React 19)               │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ Vault UI │ │ Gov UI   │ │ Transaction History│   │
│  └────┬─────┘ └────┬─────┘ └────────┬──────────┘   │
│       │             │                │               │
│       └─────────────┼────────────────┘               │
│                     │                                 │
│              @stacks/connect                          │
└─────────────────────┬─────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                    SDK (TypeScript)                   │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ │
│  │ read-only│ │ server   │ │multicall│ │ tx-build│ │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └────┬────┘ │
│       │             │            │            │      │
│       └─────────────┼────────────┼────────────┘      │
│                     │            │                    │
│              @stacks/transactions                     │
└─────────────────────┬────────────┬───────────────────┘
                      │            │
                      ▼            ▼
┌─────────────────────────────────────────────────────┐
│               Stacks Blockchain                      │
│  ┌────────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ vault-core-v4  │ │ gov-token    │ │ proposal   │ │
│  │                │ │ (SIP-010)    │ │ voting     │ │
│  └────────────────┘ └──────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Deposit Flow

1. User enters deposit amount in frontend
2. Frontend calls `@stacks/connect` to sign transaction
3. Transaction is broadcast to Stacks mempool
4. `vault-core-v4.deposit` transfers STX and records deposit
5. Governance tokens are minted proportionally
6. Frontend polls for transaction confirmation

### Governance Flow

1. Token holder creates a proposal (requires minimum balance)
2. Other token holders vote during the voting period (~144 blocks)
3. After voting period ends, anyone can execute a passing proposal
4. Execute triggers the on-chain action (e.g., reward rate change)

## Contract Dependencies

```
governance-token ◄──── proposal-voting
       ▲                     ▲
       │                     │
       └──── vault-core-v4 ──┘
```

- `vault-core-v4` mints governance tokens on deposit
- `proposal-voting` checks governance token balance for proposal creation
  and vote weight
