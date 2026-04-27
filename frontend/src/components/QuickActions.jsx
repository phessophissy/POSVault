import React from 'react';

export default function QuickActions({ onRefresh, onTab, onPrefillDeposit }) {
  return (
    <div className="quick-actions">
      <button className="btn btn-secondary btn-sm" aria-label="Refresh data" onClick={onRefresh}>↻ Refresh (R)</button>
      <button className="btn btn-secondary btn-sm" aria-label="Switch to vault tab" onClick={() => onTab('vault')}>Vault (V)</button>
      <button className="btn btn-secondary btn-sm" aria-label="Switch to governance tab" onClick={() => onTab('governance')}>Governance (G)</button>
      <button className="btn btn-secondary btn-sm" aria-label="Switch to portfolio tab" onClick={() => onTab('portfolio')}>Portfolio (P)</button>
      <button className="btn btn-secondary btn-sm" aria-label="Prefill deposit with 0.5 STX" onClick={() => onPrefillDeposit(0.5)}>Fill 0.5 STX</button>
      <button className="btn btn-secondary btn-sm" aria-label="Prefill deposit with 1 STX" onClick={() => onPrefillDeposit(1)}>Fill 1 STX</button>
      <button className="btn btn-secondary btn-sm" aria-label="Prefill deposit with 5 STX" onClick={() => onPrefillDeposit(5)}>Fill 5 STX</button>
    </div>
  );
}
