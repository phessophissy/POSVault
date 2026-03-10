# POSVault — Stacks Treasury Vault & DAO Governance

![Stacks](https://img.shields.io/badge/Built_on-Stacks-5546FF)
![Bitcoin L2](https://img.shields.io/badge/Secured_by-Bitcoin-F7931A)
![Clarity](https://img.shields.io/badge/Clarity-v3-00D4FF)
![License](https://img.shields.io/badge/License-MIT-green)

> **POSVault** is a decentralized treasury vault and DAO governance protocol built on Stacks (Bitcoin L2). Deposit STX to earn POS-GOV governance tokens, then use those tokens to shape the protocol's future through on-chain voting.

---

## 🏗️ Architecture

POSVault consists of **3 smart contracts** and a **React frontend**:

```
POSVault/
├── contracts/
│   ├── governance-token.clar    # SIP-010 POS-GOV fungible token
│   ├── vault-core-v2.clar       # STX treasury vault with yield
│   └── proposal-voting.clar     # DAO governance & voting
├── frontend/
│   └── src/
│       ├── App.jsx              # Main React application
│       ├── stacks.js            # @stacks/connect & @stacks/transactions integration
│       ├── index.css            # Design system
│       └── main.jsx             # Entry point
├── tests/
│   ├── governance-token.test.ts # Token tests (11 tests)
│   ├── vault-core-v2.test.ts    # Vault tests (13 tests)
│   └── proposal-voting.test.ts  # Governance tests (9 tests)
└── Clarinet.toml                # Project configuration
```

---

## 📜 Smart Contracts

### 1. `governance-token.clar` — POS-GOV Token (SIP-010)

The governance token implementing the SIP-010 fungible token standard.

| Feature | Details |
|---------|---------|
| Name | POSVault Governance Token |
| Symbol | POS-GOV |
| Decimals | 6 |
| Max Supply | 1,000,000,000 POS-GOV |

**Key Functions:**
- `mint` — Mint new POS-GOV tokens (owner/authorized minters only)
- `burn` — Burn POS-GOV tokens
- `transfer` — Transfer POS-GOV tokens (SIP-010)
- `add-minter` / `remove-minter` — Manage authorized minters
- `toggle-minting` — Enable/disable minting

### 2. `vault-core-v2.clar` — STX Treasury Vault

The core vault that accepts STX deposits and distributes POS-GOV yield rewards.

| Feature | Details |
|---------|---------|
| Reward Rate | 100 basis points per cycle (configurable) |
| Reward Cycle | ~144 blocks (~1 day) |
| Reward Token | POS-GOV |

**Key Functions:**
- `deposit` — Deposit STX (transfers to contract address)
- `withdraw` — Withdraw all deposited STX + pending rewards
- `claim-rewards` — Claim POS-GOV rewards without withdrawing
- `set-reward-rate` — Set reward rate (admin/owner)
- `toggle-pause` — Pause/unpause vault (admin/owner)
- `emergency-withdraw` — Emergency withdrawal (owner only)
- `add-admin` / `remove-admin` — Authorize admin contracts

### 3. `proposal-voting.clar` — DAO Governance

DAO proposal and voting system for protocol governance.

| Feature | Details |
|---------|---------|
| Voting Period | ~1,008 blocks (~7 days) |
| Min Proposal Tokens | 1 POS-GOV |
| Quorum | 10% of total supply |

**Key Functions:**
- `create-proposal` — Create a governance proposal
- `vote` — Vote on a proposal (weighted by POS-GOV balance)
- `execute-proposal` — Execute a passed proposal
- Supports proposal types: `general`, `reward-rate`, `pause`

---

## 🖥️ Frontend

The frontend is built with **React + Vite** and integrates with Stacks using:

- **`@stacks/connect`** — Wallet connection (Hiro Wallet, Leather)
- **`@stacks/transactions`** — Contract calls, read-only queries, post-conditions
- **`@stacks/network`** — Network configuration (testnet/mainnet)

### Features
- 🔐 **Vault Tab** — Deposit STX, withdraw, claim POS-GOV rewards
- 🗳️ **Governance Tab** — Create proposals, vote, execute
- 📊 **Portfolio Tab** — View wallet stats, protocol info
- ⚡ **Wallet Connect** — One-click wallet connection
- 🎨 **Premium UI** — Dark theme with glassmorphism, gradients, and micro-animations

---

## 🚀 Quick Start

### Prerequisites
- [Clarinet](https://docs.hiro.so/stacks/clarinet) v3.11+
- [Node.js](https://nodejs.org) v18+

### Smart Contracts

```bash
# Check contracts
clarinet check

# Run all tests (33 tests across 3 contracts)
npm install
npm test

# Open Clarinet console for interactive testing
clarinet console
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing

33 tests across all 3 contracts:

| Contract | Tests | Coverage |
|----------|-------|----------|
| governance-token | 11 | Token metadata, minting, transfers, burning, admin |
| vault-core-v2 | 13 | Deposits, withdrawals, stats, rewards, admin, pause |
| proposal-voting | 9 | Proposals, voting, double-vote prevention, queries |

```bash
npm test
```

---

## 📦 Dependencies

### Smart Contracts
- Clarity v3
- Clarinet SDK v3.9

### Frontend
- `react` + `react-dom`
- `@stacks/connect` — Wallet integration
- `@stacks/transactions` — Transaction building & contract calls
- `@stacks/network` — Network config
- `vite` — Build tool

---

## 🔧 Configuration

### Network
The frontend is configured for mainnet in `frontend/src/stacks.js`:
```javascript
const IS_MAINNET = true;
```

### Contract Deployer
The deployer address is set to:
```javascript
export const CONTRACT_DEPLOYER = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';
```

---

## 📄 License

MIT

---

Built with ❤️ on [Stacks](https://www.stacks.co) — secured by Bitcoin.
