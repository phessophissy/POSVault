import React, { useMemo } from 'react';
import { proposalStatus, proposalVotesTotal } from '../utils/proposals.js';

export default function ProposalInsights({ proposals = [] }) {
  const stats = useMemo(() => {
    const total = proposals.length;
    let active = 0;
    let passed = 0;
    let failed = 0;
    let totalVotes = 0;

    for (const proposal of proposals) {
      totalVotes += proposalVotesTotal(proposal);

      const status = proposalStatus(proposal);
      if (status === 'active') active += 1;
      else if (status === 'passed') passed += 1;
      else failed += 1;
    }

    return { total, active, passed, failed, totalVotes };
  }, [proposals]);

  return (
    <div className="proposal-insights">
      <div><span>Total</span><strong>{stats.total}</strong></div>
      <div><span>Active</span><strong>{stats.active}</strong></div>
      <div><span>Passed</span><strong>{stats.passed}</strong></div>
      <div><span>Failed</span><strong>{stats.failed}</strong></div>
      <div><span>Votes Cast</span><strong>{stats.totalVotes}</strong></div>
    </div>
  );
}
