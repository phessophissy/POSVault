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
