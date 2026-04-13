# Security Considerations

This document covers security best practices for deploying and operating
the POSVault system.

## Contract Security

### Access Control

The vault contracts use a deployer-based access control model:

- **Admin functions** (pause, set-reward-rate, emergency-withdraw) are
  restricted to the contract deployer.
- **User functions** (deposit, withdraw, claim-rewards) are open to any
  principal.

### Known Error Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | ERR-NOT-AUTHORIZED | Caller is not the deployer/admin |
| 202 | ERR-INSUFFICIENT-BALANCE | Withdrawal exceeds deposited amount |
| 203 | ERR-INVALID-AMOUNT | Zero or negative amount provided |
| 205 | ERR-ALREADY-DEPOSITED | User already has an active deposit |
| 206 | ERR-NO-DEPOSIT | No deposit found for the user |
| 207 | ERR-VAULT-PAUSED | Vault is currently paused |

### Recommendations

1. **Never share your deployer private key.** Use hardware wallets for
   mainnet deployments.
2. **Monitor the vault** for unexpected large withdrawals or reward claims.
3. **Pause the vault immediately** if suspicious activity is detected.
4. **Test all upgrades thoroughly** on testnet before mainnet deployment.

## Frontend Security

- All API requests use HTTPS.
- Wallet connections are handled by `@stacks/connect` which never exposes
  private keys to the frontend.
- No secrets are stored in frontend code or local storage.
- User inputs are validated before constructing contract calls.

## SDK Security

- The SDK never stores or transmits private keys.
- Server-side operations (`broadcastCall`) require a private key parameter
  that should be sourced from secure environment variables.
- Input validation functions (`validateAddress`, `validateAmount`) should
  be called before any contract interaction.

## Operational Security

- Use separate deployer accounts for testnet and mainnet.
- Rotate API keys periodically.
- Monitor contract events for anomalous activity.
- Keep dependencies up to date (`npm audit`).
