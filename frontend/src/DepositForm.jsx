import React, { useState, useCallback } from 'react';

export default function DepositForm({ onDeposit, disabled, minAmount = 0.001 }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const validate = useCallback((value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 'Enter a valid positive amount';
    if (num < minAmount) return `Minimum deposit is ${minAmount} STX`;
    if (num > 1000000) return 'Amount exceeds maximum';
    return '';
  }, [minAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate(amount);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onDeposit(parseFloat(amount));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
      setAmount(value);
      if (error) setError(validate(value));
    }
  };

  const presetAmounts = [0.1, 0.5, 1, 5, 10];

  return (
    <form onSubmit={handleSubmit} className="deposit-form">
      <div className="form-group">
        <label htmlFor="deposit-amount">Deposit Amount (STX)</label>
        <input
          id="deposit-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleChange}
          placeholder="0.00"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'deposit-error' : undefined}
        />
        {error && <span id="deposit-error" className="form-error" role="alert">{error}</span>}
      </div>
      <div className="preset-amounts">
        {presetAmounts.map(preset => (
          <button
            key={preset}
            type="button"
            className="preset-btn"
            onClick={() => { setAmount(String(preset)); setError(''); }}
            disabled={disabled}
          >
            {preset} STX
          </button>
        ))}
      </div>
      <button type="submit" className="btn btn--primary" disabled={disabled || !amount}>
        Deposit STX
      </button>
    </form>
  );
}
