import React from 'react';

export default function HotkeyLegend() {
  return (
    <div className="hotkey-legend" aria-label="Keyboard shortcuts">
      <span><kbd>R</kbd> Refresh</span>
      <span><kbd>V</kbd> Vault</span>
      <span><kbd>G</kbd> Governance</span>
      <span><kbd>P</kbd> Portfolio</span>
    </div>
  );
}
