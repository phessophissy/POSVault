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
