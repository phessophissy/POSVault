# @posvault/sdk

JavaScript/TypeScript SDK for **POSVault** — Treasury Vault & DAO Governance on [Stacks](https://www.stacks.co/) (Bitcoin L2).

## Install

```bash
npm install @posvault/sdk @stacks/transactions @stacks/network
# For browser wallet integration (optional):
npm install @stacks/connect
```

## Quick Start

### Read-only queries (browser or server)

```ts
import { getVaultInfo, getDeposit, getPendingRewards, getTokenBalance } from '@posvault/sdk';

const vault = await getVaultInfo('SP...');
console.log(vault.totalStxLocked, vault.totalDepositors, vault.rewardRate);

const deposit = await getDeposit('SP...');
const rewards = await getPendingRewards('SP...');
const balance = await getTokenBalance('SP...');
```

### Server-side (private key signing)

```ts
import { deposit, claimRewards, withdraw, sendSTX } from '@posvault/sdk';

// Deposit 1 STX
const result = await deposit(1_000_000, { senderKey: '...' });
if (result.ok) console.log('txid:', result.txid);

// Claim rewards
await claimRewards({ senderKey: '...' });

// Withdraw all
await withdraw({ senderKey: '...' });

// Send STX to another address
await sendSTX('SP...recipient', 500_000, { senderKey: '...' });
```

### Browser (wallet popup)

```ts
import { connectWallet, depositSTX, claimRewardsBrowser, withdrawSTX } from '@posvault/sdk';

// Connect wallet
connectWallet((data) => {
  console.log('Connected:', data.userSession);
});

// Deposit 0.5 STX
depositSTX(0.5, senderAddress, {
  onFinish: (data) => console.log('txid:', data.txId),
  onCancel: () => console.log('cancelled'),
});

// Claim rewards
claimRewardsBrowser({ onFinish: (data) => console.log(data.txId) });
```

### Governance

```ts
import { createProposal, vote, executeProposal, getProposal } from '@posvault/sdk';

// Create proposal (server)
await createProposal('Adjust rate', 'Set reward rate to 200bp', 'reward-rate', 200, {
  senderKey: '...',
});

// Vote (server)
await vote(1, true, { senderKey: '...' });

// Read proposal
const proposal = await getProposal(1, 'SP...');
```

## Configuration

All functions accept an optional config to override defaults:

```ts
import { getVaultInfo } from '@posvault/sdk';

const info = await getVaultInfo('SP...', {
  deployer: 'SP_CUSTOM_DEPLOYER',
  network: 'testnet',
  contractNames: { vaultCore: 'vault-core-v5' },
});
```

## Utilities

```ts
import { stxToMicro, microToStx, formatAddress, explorerUrl } from '@posvault/sdk';

stxToMicro(1.5);           // 1500000n
microToStx(1500000);       // "1.500000"
formatAddress('SP2KYZ...'); // "SP2KYZ...E09"
explorerUrl('0xabc...');   // "https://explorer.hiro.so/txid/0xabc...?chain=mainnet"
```

## API Reference

### Read-only

| Function | Returns |
|----------|---------|
| `getVaultInfo(sender)` | `{ totalStxLocked, totalDepositors, rewardRate, isPaused, currentBlock }` |
| `getDeposit(depositor)` | `{ amount, depositBlock, lastClaimBlock, totalRewardsClaimed } \| null` |
| `getUserStats(user)` | `{ totalDeposited, totalWithdrawn, totalRewards, depositCount }` |
| `getPendingRewards(depositor)` | `bigint` |
| `getRewardRate(sender)` | `bigint` |
| `isPaused(sender)` | `boolean` |
| `getTokenBalance(account)` | `bigint` |
| `getTotalSupply(sender)` | `bigint` |
| `getTotalMinted(sender)` | `bigint` |
| `isMinter(account, sender)` | `boolean` |
| `getMintingStatus(sender)` | `boolean` |
| `getProposal(id, sender)` | `Proposal \| null` |
| `getProposalCount(sender)` | `bigint` |
| `getProposalResult(id, sender)` | `ProposalResult` |
| `getVoteRecord(id, voter)` | `VoteRecord \| null` |
| `isVotingActive(id, sender)` | `boolean` |
| `getUserActiveProposal(user)` | `bigint \| null` |

### Server write operations

| Function | Parameters |
|----------|-----------|
| `deposit(amountMicro, opts)` | Deposit STX into vault |
| `withdraw(opts)` | Withdraw all STX + rewards |
| `claimRewards(opts)` | Claim pending POS-GOV rewards |
| `setRewardRate(rate, opts)` | Admin: set reward rate |
| `togglePause(opts)` | Admin: pause/unpause |
| `addAdmin(principal, opts)` | Owner: add admin |
| `removeAdmin(principal, opts)` | Owner: remove admin |
| `emergencyWithdraw(opts)` | Owner: emergency withdraw all |
| `transferToken(amount, recipient, memo, opts)` | SIP-010 transfer |
| `burnToken(amount, opts)` | Burn POS-GOV tokens |
| `addMinter(principal, opts)` | Owner: authorize minter |
| `removeMinter(principal, opts)` | Owner: revoke minter |
| `toggleMinting(opts)` | Owner: toggle minting |
| `createProposal(title, desc, type, value, opts)` | Create governance proposal |
| `vote(id, support, opts)` | Vote on proposal |
| `executeProposal(id, opts)` | Execute passed proposal |
| `sendSTX(recipient, amount, opts)` | Native STX transfer |

### Browser write operations

| Function | Description |
|----------|------------|
| `connectWallet(onFinish, onCancel)` | Wallet auth popup |
| `disconnectWallet(userSession)` | Sign out |
| `depositSTX(amountSTX, sender, callbacks)` | Deposit via wallet |
| `withdrawSTX(callbacks)` | Withdraw via wallet |
| `claimRewardsBrowser(callbacks)` | Claim via wallet |
| `createProposalBrowser(...)` | Create proposal via wallet |
| `voteOnProposal(id, support, callbacks)` | Vote via wallet |
| `executeProposalBrowser(id, callbacks)` | Execute via wallet |

## License

MIT
