# Inline Clarity contract documentation — Section 2

## vault-core-v4 Notes (Part 2)

### Constants
- `CONTRACT-OWNER`: Deployer principal
- `BLOCKS-PER-REWARD-CYCLE`: u144 (~1 day)
- Error codes: u200 (not-authorized), u202 (insufficient-balance), u203 (invalid-amount)

### Functions Documented in Section 2
- `claim-rewards`: Calculates blocks since last claim, mints POS-GOV proportionally

### Security Notes
- Uses `as-contract?` for token minting authorization
- Admin map for multi-sig-like access control
- Contract owner cannot be changed after deployment
