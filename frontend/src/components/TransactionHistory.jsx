import { useState, useEffect } from 'react';

export function TransactionHistory({ userAddress, stacksApi }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) return;
    setLoading(true);
    fetch(`${stacksApi}/extended/v1/address/${userAddress}/transactions?limit=20`)
      .then(res => res.json())
      .then(data => setTransactions(data.results || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [userAddress, stacksApi]);

  if (!userAddress) return null;
  if (loading) return <div className="tx-loading">Loading transactions...</div>;

  return (
    <div className="transaction-history">
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p className="no-transactions">No transactions found</p>
      ) : (
        <ul className="tx-list">
          {transactions.map(tx => (
            <li key={tx.tx_id} className="tx-item">
              <span className={`tx-status tx-${tx.tx_status}`}>{tx.tx_status}</span>
              <a
                href={`https://explorer.hiro.so/txid/${tx.tx_id}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                {tx.tx_id.slice(0, 12)}...
              </a>
              <span className="tx-type">{tx.tx_type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
