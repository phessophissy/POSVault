import React from 'react';

export default function AutoRefreshToggle({ enabled, onToggle }) {
  return (
    <label className="auto-refresh-toggle">
      <input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} />
      <span>Auto refresh</span>
    </label>
  );
}
