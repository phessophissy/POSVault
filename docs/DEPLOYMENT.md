# POSVault Deployment Guide

This guide covers deploying the POSVault smart contracts, SDK, and frontend to both **testnet** and **mainnet** on the Stacks blockchain.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Contract Deployment](#contract-deployment)
- [SDK Configuration](#sdk-configuration)
- [Frontend Deployment](#frontend-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| [Clarinet](https://github.com/hirosystems/clarinet) | >= 2.0 | Clarity contract development & testing |
| [Node.js](https://nodejs.org) | >= 18 | SDK build & frontend tooling |
| [Stacks CLI](https://github.com/hirosystems/stacks.js) | latest | Transaction broadcasting |
| Git | >= 2.30 | Version control |

You also need:

- A Stacks wallet with sufficient STX for deployment fees
- A funded deployer account (testnet: use the [faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet))
- Access to a Hiro API key (optional but recommended for mainnet)

## Contract Deployment

POSVault consists of three smart contracts that must be deployed **in order** due to inter-contract dependencies:

1. **governance-token** – SIP-010 governance token (POS-GOV)
2. **proposal-voting** – On-chain proposal and voting system
3. **vault-core-v4** – Treasury vault with staking and rewards

### Step 1: Run Tests

Always run the full test suite before deploying:

```bash
# Install dependencies
npm install

# Run Clarinet tests
npx vitest run

# Or use clarinet directly
clarinet test
```

### Step 2: Deploy to Testnet

```bash
# Deploy governance token first
clarinet deployments apply -p deployments/default.testnet.yaml

# Alternatively, deploy individual contracts:
stx deploy_contract contracts/governance-token.clar governance-token \
  --testnet --fee 10000
stx deploy_contract contracts/proposal-voting.clar proposal-voting \
  --testnet --fee 10000
stx deploy_contract contracts/vault-core-v4.clar vault-core-v4 \
  --testnet --fee 10000
```

### Step 3: Deploy to Mainnet

> **Warning:** Mainnet deployment is irreversible. Double-check all contract
> code and configuration before proceeding.

```bash
# Use the mainnet deployment plan
clarinet deployments apply -p deployments/default.mainnet.yaml

# Or deploy manually with higher fees for faster confirmation:
stx deploy_contract contracts/governance-token.clar governance-token \
  --mainnet --fee 50000
stx deploy_contract contracts/proposal-voting.clar proposal-voting \
  --mainnet --fee 50000
stx deploy_contract contracts/vault-core-v4.clar vault-core-v4 \
  --mainnet --fee 50000
```
