import { useState } from 'react';

export function DepositForm({ onDeposit, isConnected, isPaused }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const stxAmount = parseFloat(amount);
    if (isNaN(stxAmount) || stxAmount <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    if (stxAmount > 1000) {
      setError('Maximum deposit is 1,000 STX');
      return;
    }

    try {
      setSubmitting(true);
      const microStx = Math.round(stxAmount * 1_000_000);
      await onDeposit(microStx);
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="deposit-form" onSubmit={handleSubmit}>
      <h3>Deposit STX</h3>
      <div className="form-group">
        <label htmlFor="deposit-amount">Amount (STX)</label>
        <input
          id="deposit-amount"
          type="number"
          step="0.000001"
          min="0.000001"
          max="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          disabled={!isConnected || isPaused || submitting}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button
        type="submit"
        className="btn-deposit"
        disabled={!isConnected || isPaused || submitting || !amount}
      >
        {submitting ? 'Depositing...' : isPaused ? 'Vault Paused' : 'Deposit'}
      </button>
    </form>
  );
}
