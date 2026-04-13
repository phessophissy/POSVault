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

## SDK Configuration

After deploying contracts, update the SDK configuration to point to the correct deployer address and contract names.

### Environment Variables

Create a `.env` file (or set environment variables) with:

```bash
# Network selection
POSVAULT_NETWORK=testnet          # or "mainnet"

# Deployer address (the principal that deployed the contracts)
POSVAULT_DEPLOYER=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09

# Custom contract names (optional, defaults below)
POSVAULT_VAULT_CORE=vault-core-v4
POSVAULT_GOV_TOKEN=governance-token
POSVAULT_PROPOSAL_VOTING=proposal-voting

# API base URL (optional – auto-detected from network)
POSVAULT_API_URL=https://api.hiro.so
```

### SDK Initialization

```typescript
import { resolveConfig } from '@posvault/sdk';

const config = resolveConfig({
  network: process.env.POSVAULT_NETWORK as 'mainnet' | 'testnet',
  deployer: process.env.POSVAULT_DEPLOYER,
  contractNames: {
    vaultCore: process.env.POSVAULT_VAULT_CORE,
    governanceToken: process.env.POSVAULT_GOV_TOKEN,
    proposalVoting: process.env.POSVAULT_PROPOSAL_VOTING,
  },
});
```

### Building the SDK

```bash
cd sdk
npm install
npm run build
```

The compiled output will be in `sdk/dist/`.

## Frontend Deployment

The frontend is a React 19 app built with Vite.

### Local Development

```bash
cd frontend
npm install
npm run dev
```

### Production Build

```bash
cd frontend
npm run build
```

The build output is in `frontend/dist/`.

### Hosting Options

| Platform | Command | Notes |
|----------|---------|-------|
| Vercel | `vercel --prod` | Zero-config for Vite apps |
| Netlify | Push to connected repo | Set build command: `cd frontend && npm run build` |
| GitHub Pages | `gh-pages -d frontend/dist` | Requires `gh-pages` package |
| Self-hosted | `npx serve frontend/dist` | Any static file server works |

### Environment Variables for Frontend

Set these in your hosting platform's dashboard:

```bash
VITE_STACKS_NETWORK=mainnet
VITE_API_BASE_URL=https://api.hiro.so
VITE_DEPLOYER_ADDRESS=SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
```

## Post-Deployment Verification

After deploying, verify everything is working:

### 1. Contract Verification

Check that contracts are deployed and accessible:

```bash
# Verify vault-core-v4 is deployed
curl -s "https://api.hiro.so/v2/contracts/interface/\
SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09/vault-core-v4" | jq '.functions | length'

# Call get-vault-info to check initial state
curl -s "https://api.hiro.so/v2/contracts/call-read/\
SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09/vault-core-v4/get-vault-info" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"sender":"SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09","arguments":[]}' | jq .
```

### 2. SDK Smoke Test

```typescript
import { getVaultInfo } from '@posvault/sdk';

const info = await getVaultInfo('SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09');
console.log('Vault info:', info);
// Expected: { totalStxLocked: 0, totalDepositors: 0, ... }
```

### 3. Frontend Smoke Test

- Open the deployed frontend URL
- Connect a wallet
- Verify vault info loads correctly
- Check that the deposit form renders

## Troubleshooting

### Common Issues

#### "ERR-NOT-AUTHORIZED" (Error 200)

The calling principal is not the contract deployer or an admin. Ensure you're
using the correct deployer address.

#### "ERR-VAULT-PAUSED" (Error 207)

The vault has been paused by an admin. Call `toggle-pause` with the deployer
account to unpause.

#### Contract deployment fails with "ConflictingNonFungibleAssetNames"

A contract with the same name is already deployed at that address. Clarity
contracts are immutable – you cannot re-deploy. Use a new contract name
(e.g. `vault-core-v5`).

#### Transaction stuck in pending

Stacks transactions can take 10-30 minutes to confirm. If stuck for longer:

1. Check the mempool: `https://api.hiro.so/extended/v1/tx/mempool?address=<YOUR_ADDRESS>`
2. Consider replacing with a higher-fee transaction (same nonce)

#### Frontend shows "Failed to fetch" errors

- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS headers if self-hosting the API
- Ensure the deployer address matches the deployed contracts
