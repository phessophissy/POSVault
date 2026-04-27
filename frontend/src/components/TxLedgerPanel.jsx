import React from 'react';

export default function TxLedgerPanel({ items }) {
  return (
    <div className="tx-ledger card">
      <div className="card-title">
        <div className="card-title-icon" style={{ background: 'rgba(85,70,255,0.15)' }}>🧾</div>
        Local Transaction Ledger
      </div>

      {items.length === 0 ? (
        <div className="tx-ledger-empty">No local transactions yet.</div>
      ) : (
        <ul className="tx-ledger-list">
          {items.slice(0, 10).map((item) => (
            <li key={item.id} className="tx-ledger-row">
              <span>{item.action}</span>
              <a href={item.explorer} target="_blank" rel="noreferrer">{item.txid.slice(0, 10)}...</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
