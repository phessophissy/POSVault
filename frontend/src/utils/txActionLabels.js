const LABELS = {
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  'claim-rewards': 'Claim',
  'create-proposal': 'Create Proposal',
  vote: 'Vote',
  'execute-proposal': 'Execute',
};

export function txActionLabel(action) {
  return LABELS[action] || action;
}
