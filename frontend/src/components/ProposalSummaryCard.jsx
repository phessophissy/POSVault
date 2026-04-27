import React from 'react';
import { proposalVotesTotal } from '../utils/proposals.js';

export default function ProposalSummaryCard({ proposals }) {
  const totals = React.useMemo(() => {
    const count = proposals.length;
    const votes = proposals.reduce((sum, proposal) => sum + proposalVotesTotal(proposal), 0);
    const avgVotes = count > 0 ? (votes / count).toFixed(2) : '0.00';
    return { count, votes, avgVotes };
  }, [proposals]);

  return (
    <div className="proposal-summary-card">
      <div><span>Shown</span><strong>{totals.count}</strong></div>
      <div><span>Total Votes</span><strong>{totals.votes}</strong></div>
      <div><span>Avg Votes/Proposal</span><strong>{totals.avgVotes}</strong></div>
    </div>
  );
}
