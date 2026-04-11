import React from 'react';
import { formatNumber } from './stacks.js';

export default function ProposalCard({ proposal, onVote, onExecute, votingActive }) {
  if (!proposal) return null;

  const totalVotes = Number(proposal.votesFor) + Number(proposal.votesAgainst);
  const forPct = totalVotes > 0 ? (Number(proposal.votesFor) / totalVotes * 100).toFixed(1) : 0;
  const againstPct = totalVotes > 0 ? (Number(proposal.votesAgainst) / totalVotes * 100).toFixed(1) : 0;

  return (
    <div className={`proposal-card ${proposal.executed ? 'proposal--executed' : ''}`}>
      <div className="proposal-header">
        <h3>{proposal.title}</h3>
        <span className={`proposal-badge proposal-badge--${proposal.proposalType}`}>
          {proposal.proposalType}
        </span>
      </div>
      <p className="proposal-description">{proposal.description}</p>

      <div className="vote-bar">
        <div className="vote-bar__for" style={{ width: `${forPct}%` }} />
        <div className="vote-bar__against" style={{ width: `${againstPct}%` }} />
      </div>
      <div className="vote-counts">
        <span className="vote-for">For: {formatNumber(proposal.votesFor)} ({forPct}%)</span>
        <span className="vote-against">Against: {formatNumber(proposal.votesAgainst)} ({againstPct}%)</span>
      </div>

      <div className="proposal-meta">
        <span>Voters: {formatNumber(proposal.totalVoters)}</span>
        <span>Status: {proposal.executed ? 'Executed' : proposal.passed ? 'Passed' : 'Active'}</span>
      </div>

      {votingActive && !proposal.executed && (
        <div className="proposal-actions">
          <button className="btn btn--success" onClick={() => onVote(true)}>Vote For</button>
          <button className="btn btn--danger" onClick={() => onVote(false)}>Vote Against</button>
        </div>
      )}
      {proposal.passed && !proposal.executed && (
        <button className="btn btn--primary" onClick={onExecute}>Execute Proposal</button>
      )}
    </div>
  );
}
