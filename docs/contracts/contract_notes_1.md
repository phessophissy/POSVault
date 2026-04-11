# Inline Clarity contract documentation — Section 1

## vault-core-v4 Notes (Part 1)

### Constants
- `CONTRACT-OWNER`: Deployer principal
- `BLOCKS-PER-REWARD-CYCLE`: u144 (~1 day)
- Error codes: u200 (not-authorized), u202 (insufficient-balance), u203 (invalid-amount)

### Functions Documented in Section 1
- `withdraw`: Returns deposited STX, auto-claims pending rewards, removes deposit record

### Security Notes
- Uses `as-contract?` for token minting authorization
- Admin map for multi-sig-like access control
- Contract owner cannot be changed after deployment
