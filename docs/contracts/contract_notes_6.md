# Inline Clarity contract documentation — Section 6

## vault-core-v4 Notes (Part 6)

### Constants
- `CONTRACT-OWNER`: Deployer principal
- `BLOCKS-PER-REWARD-CYCLE`: u144 (~1 day)
- Error codes: u200 (not-authorized), u202 (insufficient-balance), u203 (invalid-amount)

### Functions Documented in Section 6
- `withdraw`: Returns deposited STX, auto-claims pending rewards, removes deposit record

### Security Notes
- Uses `as-contract?` for token minting authorization
- Admin map for multi-sig-like access control
- Contract owner cannot be changed after deployment
