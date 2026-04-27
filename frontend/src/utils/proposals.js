export function proposalStatus(proposal) {
  const isExecuted = proposal?.executed?.value === true || proposal?.executed?.value === 'true';
  const isPassed = proposal?.passed?.value === true || proposal?.passed?.value === 'true';

  if (!isExecuted) return 'active';
  return isPassed ? 'passed' : 'failed';
}

export function proposalVotesTotal(proposal) {
  return Number(proposal?.['votes-for']?.value || 0) + Number(proposal?.['votes-against']?.value || 0);
}
