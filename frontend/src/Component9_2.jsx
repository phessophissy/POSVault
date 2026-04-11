import React from 'react';

/**
 * Token Management - Component 2
 */
export default function Component9_2({ data, onAction, className = '' }) {
  if (!data) return null;

  return (
    <div className={`component-container ${className}`}>
      <div className="component-header">
        <h4>Token Management #2</h4>
      </div>
      <div className="component-body">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="data-row">
            <span className="data-label">{key}</span>
            <span className="data-value">{String(value)}</span>
          </div>
        ))}
      </div>
      {onAction && (
        <button className="btn btn--sm" onClick={onAction}>
          Action
        </button>
      )}
    </div>
  );
}
