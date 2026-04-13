import { useTransactionHistory } from '../hooks/useTransactionHistory.js';
import { TransactionRow } from './TransactionRow.jsx';
import { TransactionFilters } from './TransactionFilters.jsx';
import { computeTxStats } from '../utils/txStats.js';
import { formatMicroStx } from '../utils/txFormatters.js';

/**
 * Full transaction history panel with filtering, pagination,
 * and error handling.
 *
 * @param {{ userAddress: string|null, apiBaseUrl?: string, network?: string }} props
 */
export function TransactionHistoryPanel({
  userAddress,
  apiBaseUrl = 'https://api.hiro.so',
  network = 'mainnet',
}) {
  const {
    transactions,
    allTransactions,
    loading,
    error,
    hasMore,
    typeFilter,
    statusFilter,
    setTypeFilter,
    setStatusFilter,
    loadMore,
    refresh,
  } = useTransactionHistory(userAddress, apiBaseUrl);

  if (!userAddress) {
    return (
      <div className="tx-panel tx-panel--empty">
        <p>Connect your wallet to view transaction history.</p>
      </div>
    );
  }

  return (
    <div className="tx-panel">
      <div className="tx-panel__header">
        <h3>Transaction History</h3>
        <button
          className="tx-panel__refresh"
          onClick={refresh}
          disabled={loading}
          title="Refresh transactions"
        >
          ↻
        </button>
      </div>

      <TransactionFilters
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
      />

      {error && (
        <div className="tx-panel__error" role="alert">
          Failed to load transactions: {error}
        </div>
      )}

      {allTransactions.length > 0 && (() => {
        const stats = computeTxStats(allTransactions);
        return (
          <div className="tx-panel__stats">
            <span>{stats.confirmed} confirmed</span>
            <span>{stats.pending} pending</span>
            <span>{stats.failed} failed</span>
            <span>Fees: {formatMicroStx(stats.totalFees)}</span>
          </div>
        );
      })()}

      <div className="tx-panel__count">
        Showing {transactions.length} of {allTransactions.length} transactions
      </div>

      {transactions.length === 0 && !loading && (
        <p className="tx-panel__empty-msg">
          {allTransactions.length > 0
            ? 'No transactions match the current filters.'
            : 'No transactions found for this address.'}
        </p>
      )}

      <ul className="tx-panel__list">
        {transactions.map((tx) => (
          <TransactionRow key={tx.tx_id} tx={tx} network={network} />
        ))}
      </ul>

      {loading && <div className="tx-panel__loading">Loading…</div>}

      {hasMore && !loading && (
        <button className="tx-panel__load-more" onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
