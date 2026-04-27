import React from 'react';

export default function ProposalControls({ query, status, sort, resultCount, onQuery, onStatus, onSort, onClear }) {
  return (
    <div>
      <div className="proposal-controls">
      <input
        className="form-input"
        type="search"
        placeholder="Search proposals"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
      />
      <select className="form-input form-select" value={status} onChange={(event) => onStatus(event.target.value)}>
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="passed">Passed</option>
        <option value="failed">Failed</option>
      </select>
      <select className="form-input form-select" value={sort} onChange={(event) => onSort(event.target.value)}>
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="most-votes">Most Votes</option>
      </select>

      <button className="btn btn-secondary" onClick={onClear}>Clear</button>
      </div>

      <div className="proposal-controls-meta">Showing {resultCount} proposals</div>
    </div>
  );
}
