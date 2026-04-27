import React from 'react';

export default function QuickActions({ onRefresh, onTab, onPrefillDeposit }) {
  return (
    <div className="quick-actions">
      <button className="btn btn-secondary btn-sm" onClick={onRefresh}>↻ Refresh</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onTab('vault')}>Vault</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onTab('governance')}>Governance</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onTab('portfolio')}>Portfolio</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onPrefillDeposit(1)}>Fill 1 STX</button>
    </div>
  );
}
