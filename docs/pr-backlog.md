# POSVault PR Backlog (Scoped, Real Improvements)

Generated: 2026-02-23  
Basis: static code audit of contracts, tests, deployment config, and frontend.  
Note: test execution was blocked in this environment by repeated `npm` registry `ETIMEDOUT` during dependency install.

## Prioritized PR Queue

| ID | Priority | PR Title | Why it matters | Primary scope |
|---|---|---|---|---|
| PV-001 | P0 | Governance vote snapshot / anti-double-count model | Current voting power is read at vote time, allowing token movement between wallets to amplify effective influence. | `contracts/proposal-voting.clar`, `tests/proposal-voting.test.ts`, `README.md` |
| PV-002 | P0 | Enforce proposal type/value validation and active-proposal lifecycle | `proposal-type` is not validated and `active-proposals` is written but never enforced/cleared. | `contracts/proposal-voting.clar`, `tests/proposal-voting.test.ts` |
| PV-003 | P0 | Add reward-rate bounds and overflow-safe reward math | Reward math can become unsafe at extreme values; reward rate currently has no cap. | `contracts/vault-core.clar`, `tests/vault-core.test.ts` |
| PV-004 | P0 | Add explicit post-deploy wiring for contract permissions | Reward minting and DAO execution depend on inter-contract authorization not encoded in deployment flow. | `deployments/default.simnet-plan.yaml`, `README.md`, optional setup script/docs |
| PV-005 | P0 | Expand critical-path contract tests | Existing tests miss several high-risk scenarios (governance execution rules, reward timing, admin misuse). | `tests/*.test.ts` |
| PV-006 | P1 | Externalize network/deployer config to environment | Frontend hardcodes network mode and deployer address, making staging/mainnet promotion error-prone. | `frontend/src/stacks.js`, `frontend/README` or top-level docs |
| PV-007 | P1 | Restore wallet session on page reload | UX currently loses connected state between refreshes. | `frontend/src/App.jsx`, `frontend/src/stacks.js` |
| PV-008 | P1 | Improve proposal data loading (pagination + parallel fetch) | Proposal list fetching is sequential and capped to 20, which does not scale. | `frontend/src/App.jsx` |
| PV-009 | P1 | Add governance action guardrails in UI | Execute button appears before voting closes, leading to avoidable failed transactions. | `frontend/src/App.jsx` |
| PV-010 | P1 | Map contract errors to user-friendly toast messages | Most read/write failures are swallowed or generic, making troubleshooting difficult. | `frontend/src/App.jsx`, `frontend/src/stacks.js` |
| PV-011 | P2 | Fix docs/spec consistency (supply and operational details) | Token max supply in docs conflicts with contract constant, causing governance/economic confusion. | `README.md`, `contracts/governance-token.clar` comments |
| PV-012 | P2 | Add CI checks for contracts/tests/secrets | No automated gate for regressions or accidental secret commits. | `.github/workflows/*`, optional secret scanning config |
| PV-013 | P2 | Tighten Clarinet static analysis defaults | `check_checker` strict mode is off; enabling stricter analysis catches more contract issues early. | `Clarinet.toml`, contract fixes as needed |
| PV-014 | P2 | Revisit lockfile policy and dependency reproducibility | `.gitignore` excludes lockfiles, reducing deterministic installs for collaborators/CI. | `.gitignore`, `package.json`, `frontend/package.json` |

## PR Scoping Details

### PV-001 (P0): Governance vote snapshot / anti-double-count model
- Problem evidence:
  - Voting weight is pulled from current token balance during `vote` (`contracts/proposal-voting.clar:131`).
  - Tokens can be transferred freely (`contracts/governance-token.clar:53`), enabling repeated influence via token movement across accounts.
- Expected deliverables:
  - Snapshot/escrow strategy implemented in contract logic.
  - New tests proving token transfer after first vote cannot increase aggregate influence.
  - Migration note in README for governance semantics.
- Acceptance criteria:
  - Attempted “vote, transfer, vote from second wallet” path cannot increase effective total voting power beyond intended model.

### PV-002 (P0): Proposal validation + active-proposal lifecycle
- Problem evidence:
  - `ERR-INVALID-PROPOSAL` is defined but not enforced (`contracts/proposal-voting.clar:18`, `contracts/proposal-voting.clar:80`).
  - `active-proposals` is set but no policy is enforced and it is not cleared on execution (`contracts/proposal-voting.clar:62`, `contracts/proposal-voting.clar:110`, `contracts/proposal-voting.clar:198`).
- Expected deliverables:
  - Validate proposal type/value combinations (`general`, `reward-rate`, `pause`).
  - Enforce “one active proposal per proposer” or remove the map entirely.
  - Clear/update proposer active state after proposal completion.
- Acceptance criteria:
  - Invalid type/value submissions fail with explicit error.
  - Active-proposal behavior is deterministic and fully tested.

### PV-003 (P0): Reward safety bounds and math hardening
- Problem evidence:
  - Reward rate has no upper bound (`contracts/vault-core.clar:233`).
  - Reward math multiplies amount * rate * cycles without guard rails (`contracts/vault-core.clar:74`).
- Expected deliverables:
  - Add capped reward-rate constant and validation.
  - Refactor reward calculation to reduce overflow risk and define edge behavior.
  - Tests for extreme but valid input values.
- Acceptance criteria:
  - Out-of-range reward rates are rejected.
  - Large-but-valid deposits/cycles no longer create overflow/abort paths.

### PV-004 (P0): Deployment permission wiring
- Problem evidence:
  - Deployment plan only publishes contracts and does not assign required minter/admin permissions (`deployments/default.simnet-plan.yaml`).
- Expected deliverables:
  - Documented/setup step (or deployment transaction batch) to call:
    - `governance-token.add-minter(<vault-core-principal>)`
    - `vault-core.add-admin(<proposal-voting-principal>)`
  - Validation checklist in README.
- Acceptance criteria:
  - End-to-end governance and reward flows work in a fresh simnet without manual hidden steps.

### PV-005 (P0): Critical-path test expansion
- Gaps to cover:
  - Voting end/execute outcomes with quorum pass/fail.
  - Reward accrual across block cycles and claim/withdraw interactions.
  - Admin authorization failure paths.
- Acceptance criteria:
  - New tests reproduce each critical branch and fail on regression.

### PV-006 (P1): Environment-based frontend chain config
- Problem evidence:
  - Hardcoded network flag and deployer address in `frontend/src/stacks.js:26` and `frontend/src/stacks.js:30`.
- Acceptance criteria:
  - Network and contract addresses are controlled by env vars with safe defaults and documented setup.

### PV-007 (P1): Wallet session persistence
- Problem evidence:
  - Connection exists only in memory state (`frontend/src/App.jsx:30`, `frontend/src/App.jsx:52`).
- Acceptance criteria:
  - Reload retains connected wallet context when session is valid.

### PV-008 (P1): Proposal fetch performance
- Problem evidence:
  - Sequential proposal fetch loop in `frontend/src/App.jsx:124`.
- Acceptance criteria:
  - Proposal loading uses bounded parallelization and UI pagination/load-more controls.

### PV-009 (P1): Governance UX guardrails
- Problem evidence:
  - Execute action shown whenever not executed (`frontend/src/App.jsx:660`) without checking voting window.
- Acceptance criteria:
  - Execute action only available when proposal can actually be executed.

### PV-010 (P1): Error mapping and surfaced failures
- Problem evidence:
  - Many read failures are swallowed (`frontend/src/App.jsx:95`, `frontend/src/App.jsx:101`, `frontend/src/App.jsx:128`, `frontend/src/App.jsx:131`).
- Acceptance criteria:
  - Transaction and read failures surface actionable user-facing messages.

### PV-011 (P2): Docs consistency cleanup
- Problem evidence:
  - Contract max supply comment says 100M (`contracts/governance-token.clar:19`), while README advertises 1,000,000,000.
- Acceptance criteria:
  - One authoritative supply spec reflected consistently across docs and contract comments.

### PV-012 (P2): CI quality/security gates
- Acceptance criteria:
  - CI runs contract checks, tests, and secret scan on PRs.

### PV-013 (P2): Stricter static analysis
- Problem evidence:
  - `strict = false` in `Clarinet.toml`.
- Acceptance criteria:
  - Strict mode enabled or explicitly justified with tracked exceptions.

### PV-014 (P2): Dependency reproducibility
- Problem evidence:
  - Lockfiles ignored in `.gitignore`.
- Acceptance criteria:
  - Dependency policy is explicit and reproducible across contributors/CI.

## Recommended First 3 PRs to Open

1. `PV-002` Proposal validation + active-proposal lifecycle (smallest P0 blast radius).
2. `PV-004` Deployment permission wiring (unblocks realistic end-to-end flows).
3. `PV-005` Critical-path tests (locks in behavior before deeper governance math changes).
