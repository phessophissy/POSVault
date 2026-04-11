# Architecture documentation and diagrams — Part 1

## Overview
POSVault is a STX staking vault with governance token rewards and on-chain proposal voting.

### Section 1 Topics
#### Reward Mechanism
Rewards are calculated as: `(amount * rate * elapsed-blocks) / (BLOCKS-PER-CYCLE * 10000)`
The `governance-token` contract mints POS-GOV as rewards.

### Deployer
`SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09`
