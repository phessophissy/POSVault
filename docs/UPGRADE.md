# Contract Upgrade Guide

POSVault supports iterative contract upgrades by deploying new contract
versions alongside existing ones. Clarity contracts are immutable – you
cannot modify a deployed contract – so upgrades require deploying a new
version and migrating state.

## Upgrade Strategy

### 1. Deploy the New Contract

```bash
# Example: upgrading from vault-core-v4 to vault-core-v5
stx deploy_contract contracts/vault-core-v5.clar vault-core-v5 \
  --mainnet --fee 50000
```

### 2. Pause the Old Contract

Before migrating, pause the old vault to prevent new deposits:

```bash
# Using the SDK
import { togglePause } from '@posvault/sdk';
await togglePause({ network: 'mainnet' });
```

### 3. Update SDK Configuration

Point the SDK to the new contract name:

```typescript
const config = resolveConfig({
  contractNames: {
    vaultCore: 'vault-core-v5',  // ← updated
    governanceToken: 'governance-token',
    proposalVoting: 'proposal-voting',
  },
});
```

### 4. Update Frontend Environment

```bash
VITE_VAULT_CORE_CONTRACT=vault-core-v5
```

### 5. Notify Users

Announce the upgrade through your communication channels. Users with
existing deposits in the old vault will need to withdraw and re-deposit
into the new vault.

## Version History

| Version | Contract | Status | Notes |
|---------|----------|--------|-------|
| v2 | vault-core-v2 | Deprecated | Initial release |
| v3 | vault-core-v3 | Deprecated | Added reward system |
| v4 | vault-core-v4 | **Active** | Admin controls, pause, improved rewards |

## Migration Checklist

- [ ] New contract passes all tests
- [ ] Old vault is paused
- [ ] SDK updated to new contract name
- [ ] Frontend env vars updated
- [ ] Explorer links verified
- [ ] Users notified of migration
- [ ] Old vault deposits accounted for
