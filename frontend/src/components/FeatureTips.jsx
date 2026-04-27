import React from 'react';

export default function FeatureTips() {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-title">
        <div className="card-title-icon" style={{ background: 'rgba(85,70,255,0.15)' }}>💡</div>
        Power Tips
      </div>
      <ul className="feature-tips-list">
        <li>Press R to refresh quickly from anywhere.</li>
        <li>Use V/G/P keyboard shortcuts to jump tabs.</li>
        <li>Export your local ledger CSV before cleanup.</li>
      </ul>
    </div>
  );
}
