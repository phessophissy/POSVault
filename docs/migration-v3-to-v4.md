# Migration V3 To V4

## Overview

This document provides comprehensive guidance for migration v3 to v4 in the POSVault ecosystem.

### Purpose

The POSVault protocol requires clear documentation to ensure safe operations and community transparency.

## Prerequisites

- Stacks wallet with sufficient STX for gas fees
- Understanding of Clarity smart contracts
- Familiarity with POSVault vault-core-v4 contract
- Node.js >= 18 for SDK usage

## Architecture

### Contract Hierarchy

1. **vault-core-v4**: Main staking vault contract
2. **governance-token**: POS-GOV SIP-010 token
3. **proposal-voting**: On-chain governance mechanism

### Data Flow

Users deposit STX → Vault tracks deposits → Rewards accrue per cycle → Users claim or withdraw

## Configuration

### Network Settings

| Parameter | Mainnet | Testnet |
|-----------|---------|--------|
| Deployer | SP2KYZ... | ST1PQ... |
| Reward Cycle | 144 blocks | 144 blocks |
| Voting Period | 1008 blocks | 1008 blocks |
| Token Decimals | 6 | 6 |

## Step-by-Step Guide

### Step 1: Environment Setup

```bash
npm install @posvault/sdk
export STACKS_NETWORK=mainnet
```

### Step 2: Initialize SDK

```typescript
import { POSVault } from "@posvault/sdk";
const vault = new POSVault({ network: "mainnet" });
```

### Step 3: Verify Contract State

Before any operation, verify the vault is not paused:

```typescript
const info = await vault.getVaultInfo();
if (info.isPaused) {
  console.error("Vault is currently paused");
  process.exit(1);
}
console.log(`Total locked: ${info.totalStxLocked}`);
```

### Step 4: Execute Operations

```typescript
// Deposit
const depositTx = await vault.deposit(1000000n); // 1 STX

// Check status
const deposit = await vault.getDeposit(address);
console.log(`Amount: ${deposit.amount}`);
console.log(`Since block: ${deposit.depositBlock}`);
```

## Security Considerations

### Access Control

- Only contract deployer can pause/unpause the vault
- Users can only withdraw their own deposits
- Governance votes are weighted by token holdings

### Risk Factors

1. Smart contract risk: Audited but non-zero risk
2. Network congestion: Transactions may be delayed
3. Reward rate changes: Subject to governance votes

## Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| ERR-NOT-AUTHORIZED (u100) | Wrong sender | Use correct wallet |
| ERR-VAULT-PAUSED (u101) | Vault is paused | Wait for admin unpause |
| ERR-NO-DEPOSIT (u102) | No active deposit | Deposit first |
| ERR-ALREADY-DEPOSITED (u103) | Existing deposit | Withdraw first |

## Monitoring

### Health Checks

Run the health check script periodically:

```bash
npm run health-check
```

This verifies:
- Contract is responsive
- Vault is not paused
- Reward rate is within expected range
- No suspicious large withdrawals

## Metrics

### Key Performance Indicators

- **TVL (Total Value Locked)**: Total STX in vault
- **Unique Depositors**: Number of active stakers
- **Average Deposit Size**: TVL / Depositors
- **Governance Participation**: Votes cast / Eligible voters
- **Reward Distribution Rate**: Tokens minted per cycle

## API Endpoints

### Read-Only Functions

```clarity
(get-vault-info)
(get-deposit (user principal))
(get-user-stats (user principal))
(get-proposal (id uint))
(get-vote-record (proposal-id uint) (voter principal))
```

## Changelog

### v4.0.0
- Removed lock period requirement
- Added pending POS-GOV reward token minting on withdrawal
- Improved gas efficiency for batch operations

### v3.0.0
- Added governance token integration
- Introduced proposal voting mechanism
- Added reward rate adjustment via governance

## FAQ

**Q: Is there a minimum deposit amount?**
A: No minimum, but gas fees apply to all transactions.

**Q: How are rewards calculated?**
A: Rewards accrue per 144-block cycle based on the current reward rate.

**Q: Can I withdraw at any time?**
A: Yes, v4 has no lock period. Withdrawals are instant.

**Q: How do governance votes work?**
A: POS-GOV token holders can vote on proposals during the 1008-block voting window.
