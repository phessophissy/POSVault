import React, { useState, useEffect } from "react";

/**
 * TransactionFeed Component
 * Provides vault interaction UI for POSVault protocol
 */

const VAULT_CONTRACT = "SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.vault-core-v4";

/** Format micro-STX to human readable */
function formatSTX(micro) {
  return (Number(micro) / 1000000).toFixed(6);
}

/** Format address for display */
function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Loading spinner sub-component */
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

/** Error display sub-component */
function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <span className="error-icon">⚠</span>
      <span>{error}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

/** Status badge sub-component */
function StatusBadge({ status }) {
  const colors = {
    active: "#4CAF50",
    pending: "#FFC107",
    completed: "#2196F3",
    failed: "#F44336",
  };
  return (
    <span
      className="status-badge"
      style={ { backgroundColor: colors[status] || "#999" } }
    >
      {status}
    </span>
  );
}

/** Amount input sub-component */
function AmountInput({ value, onChange, max, label = "Amount (STX)" }) {
  return (
    <div className="amount-input">
      <label>{label}</label>
      <div className="input-group">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0"
          step="0.000001"
          placeholder="0.000000"
        />
        {max && (
          <button className="max-btn" onClick={() => onChange(max)}>
            MAX
          </button>
        )}
      </div>
    </div>
  );
}

/** Data table sub-component */
function DataTable({ columns, rows, emptyMessage = "No data available" }) {
  if (rows.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Confirmation modal sub-component */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

/** Stats card sub-component */
function StatsCard({ label, value, unit = "", trend }) {
  return (
    <div className="stats-card">
      <div className="stats-label">{label}</div>
      <div className="stats-value">
        {value} {unit && <span className="stats-unit">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`stats-trend ${trend >= 0 ? "positive" : "negative"}`}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/** Custom hook for vault data */
function useVaultData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        // Simulated vault data fetch
        const result = {
          totalLocked: "1000000000",
          depositors: 100,
          rewardRate: 50,
          isPaused: false,
        };
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

/** Pagination sub-component */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={p === currentPage ? "active" : ""}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

/** Main TransactionFeed component */
export default function TransactionFeed() {
  const { data, loading, error } = useVaultData();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) return <LoadingSpinner message="Loading vault data..." />;

  return (
    <div className="transactionfeed-container">
      <h2>TransactionFeed</h2>
      <ErrorBanner error={error} onDismiss={() => {}} />
      <div className="tabs">
        {["overview", "details", "history"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {data && (
        <div className="stats-grid">
          <StatsCard label="Total Locked" value={formatSTX(data.totalLocked)} unit="STX" />
          <StatsCard label="Depositors" value={data.depositors} />
          <StatsCard label="Reward Rate" value={data.rewardRate} unit="bps" />
          <StatusBadge status={data.isPaused ? "paused" : "active"} />
        </div>
      )}
    </div>
  );
}
