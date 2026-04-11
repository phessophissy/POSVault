# Architecture documentation and diagrams — Part 4

## Overview
POSVault is a STX staking vault with governance token rewards and on-chain proposal voting.

### Section 4 Topics
#### Deposit Architecture
The vault accepts STX deposits and tracks them in a `deposits` map keyed by principal.
Each deposit records the amount, block height, and last claim block.

### Deployer
`SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09`
