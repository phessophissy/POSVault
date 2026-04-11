# Inline Clarity contract documentation — Section 9

## vault-core-v4 Notes (Part 9)

### Constants
- `CONTRACT-OWNER`: Deployer principal
- `BLOCKS-PER-REWARD-CYCLE`: u144 (~1 day)
- Error codes: u200 (not-authorized), u202 (insufficient-balance), u203 (invalid-amount)

### Functions Documented in Section 9
- `set-reward-rate (rate uint)`: Updates reward basis points, admin-only, max 10000

### Security Notes
- Uses `as-contract?` for token minting authorization
- Admin map for multi-sig-like access control
- Contract owner cannot be changed after deployment
