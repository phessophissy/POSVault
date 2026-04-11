# Inline Clarity contract documentation — Section 5

## vault-core-v4 Notes (Part 5)

### Constants
- `CONTRACT-OWNER`: Deployer principal
- `BLOCKS-PER-REWARD-CYCLE`: u144 (~1 day)
- Error codes: u200 (not-authorized), u202 (insufficient-balance), u203 (invalid-amount)

### Functions Documented in Section 5
- `deposit (amount uint)`: Locks STX in vault, creates deposit record, increments total-depositors

### Security Notes
- Uses `as-contract?` for token minting authorization
- Admin map for multi-sig-like access control
- Contract owner cannot be changed after deployment
