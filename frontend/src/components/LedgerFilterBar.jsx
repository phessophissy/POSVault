import React from 'react';

export default function LedgerFilterBar({ query, action, onQuery, onAction, actions = [] }) {
  return (
    <div className="ledger-filter-bar">
      <input
        className="form-input"
        type="search"
        placeholder="Filter by txid"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
      />
      <select className="form-input form-select" value={action} onChange={(event) => onAction(event.target.value)}>
        <option value="all">All Actions</option>
        {actions.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
