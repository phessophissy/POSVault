import { useState } from 'react';

export function WithdrawButton({ onWithdraw, hasDeposit, isConnected }) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setSubmitting(true);
    onWithdraw()
      .then(() => setConfirming(false))
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const handleCancel = () => setConfirming(false);

  if (!isConnected || !hasDeposit) return null;

  return (
    <div className="withdraw-section">
      {confirming && (
        <p className="withdraw-warning">
          This will withdraw all your STX and claim pending rewards. Continue?
        </p>
      )}
      <div className="withdraw-actions">
        <button
          className={`btn-withdraw ${confirming ? 'btn-confirm' : ''}`}
          onClick={handleClick}
          disabled={submitting}
        >
          {submitting ? 'Processing...' : confirming ? 'Confirm Withdraw' : 'Withdraw All'}
        </button>
        {confirming && (
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
}
