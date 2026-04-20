import React, { useState, useEffect } from "react";

/**
 * DepositForm Component
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
