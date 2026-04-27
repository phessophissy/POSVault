import React from 'react';

export default function QuickActions({ onRefresh, onTab, onPrefillDeposit }) {
  return (
    <div className="quick-actions">
      <button className="btn btn-secondary btn-sm" onClick={onRefresh}>↻ Refresh (R)</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onTab('vault')}>Vault (V)</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onTab('governance')}>Governance (G)</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onTab('portfolio')}>Portfolio (P)</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onPrefillDeposit(0.5)}>Fill 0.5 STX</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onPrefillDeposit(1)}>Fill 1 STX</button>
      <button className="btn btn-secondary btn-sm" onClick={() => onPrefillDeposit(5)}>Fill 5 STX</button>
    </div>
  );
}
