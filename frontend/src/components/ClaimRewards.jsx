import { useState } from 'react';

export function ClaimRewards({ onClaim, pendingRewards, isConnected }) {
  const [submitting, setSubmitting] = useState(false);

  const hasPending = pendingRewards && Number(pendingRewards) > 0;
  const formattedRewards = hasPending
    ? `${(Number(pendingRewards) / 1e6).toFixed(6)} POS-GOV`
    : '0 POS-GOV';

  const handleClaim = async () => {
    setSubmitting(true);
    try {
      await onClaim();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="claim-rewards">
      <h3>Claim Rewards</h3>
      <div className="rewards-info">
        <span>Pending: {formattedRewards}</span>
      </div>
      <button
        className="btn-claim"
        onClick={handleClaim}
        disabled={!isConnected || !hasPending || submitting}
      >
        {submitting ? 'Claiming...' : 'Claim Rewards'}
      </button>
    </div>
  );
}
