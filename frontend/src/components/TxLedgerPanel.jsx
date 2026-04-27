import React from 'react';
import LedgerFilterBar from './LedgerFilterBar.jsx';

export default function TxLedgerPanel({ items, onClear }) {
  const [query, setQuery] = React.useState('');
  const [action, setAction] = React.useState('all');

  const actions = React.useMemo(() => {
    const set = new Set(items.map((item) => item.action));
    return Array.from(set).sort();
  }, [items]);

  const visibleItems = React.useMemo(() => {
    let next = [...items];
    if (query.trim()) {
      const q = query.toLowerCase();
      next = next.filter((item) => String(item.txid || '').toLowerCase().includes(q));
    }
    if (action !== 'all') {
      next = next.filter((item) => item.action === action);
    }
    return next;
  }, [items, query, action]);

  const exportCsv = () => {
    if (!visibleItems.length) return;
    const header = 'action,txid,explorer';
    const rows = visibleItems.map((item) => `${item.action},${item.txid},${item.explorer}`);
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'posvault-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tx-ledger card">
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="card-title-icon" style={{ background: 'rgba(85,70,255,0.15)' }}>🧾</div>
        <span>Local Transaction Ledger</span>
        <button className="btn btn-secondary" aria-label="Export transaction ledger as CSV" style={{ marginLeft: 'auto' }} onClick={exportCsv}>Export CSV</button>
        <button className="btn btn-secondary" aria-label="Clear local transaction ledger" onClick={onClear}>Clear</button>
      </div>

      <LedgerFilterBar
        query={query}
        action={action}
        actions={actions}
        onQuery={setQuery}
        onAction={setAction}
      />

      {visibleItems.length === 0 ? (
        <div className="tx-ledger-empty">No local transactions yet.</div>
      ) : (
        <ul className="tx-ledger-list">
          {visibleItems.slice(0, 10).map((item) => (
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
