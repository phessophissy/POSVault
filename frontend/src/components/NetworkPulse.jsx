import React from 'react';

function formatAgo(timestampMs) {
  if (!timestampMs) return 'never';
  const diff = Date.now() - timestampMs;
  if (diff < 1000) return 'just now';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function NetworkPulse({ loading, lastUpdatedAt, errorCount = 0 }) {
  const status = loading ? 'syncing' : errorCount > 0 ? 'degraded' : 'healthy';

  return (
    <div className={`network-pulse network-pulse-${status}`}>
      <span className="network-pulse-indicator" />
      <div className="network-pulse-copy">
        <strong>{status === 'healthy' ? 'Network healthy' : status === 'syncing' ? 'Syncing data' : 'Network degraded'}</strong>
        <span>Updated {formatAgo(lastUpdatedAt)}</span>
      </div>
    </div>
  );
}
