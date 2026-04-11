import { useState, useMemo } from 'react';

export function RewardCalculator({ rewardRate }) {
  const [stxAmount, setStxAmount] = useState('1');
  const [days, setDays] = useState('30');

  const estimate = useMemo(() => {
    const stx = parseFloat(stxAmount) || 0;
    const numDays = parseInt(days) || 0;
    const rate = Number(rewardRate) || 100;
    const cycles = numDays; // ~1 cycle per day (144 blocks)
    const rewardsPerCycle = (stx * 1_000_000 * rate) / 10000;
    const totalRewards = rewardsPerCycle * cycles;
    return (totalRewards / 1_000_000).toFixed(6);
  }, [stxAmount, days, rewardRate]);

  return (
    <div className="reward-calculator">
      <h3>Reward Estimator</h3>
      <div className="calc-inputs">
        <div className="calc-field">
          <label>Deposit (STX)</label>
          <input
            type="number"
            value={stxAmount}
            onChange={(e) => setStxAmount(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>
        <div className="calc-field">
          <label>Duration (days)</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            max="365"
          />
        </div>
      </div>
      <div className="calc-result">
        <span>Estimated POS-GOV rewards:</span>
        <strong>{estimate} POS-GOV</strong>
      </div>
    </div>
  );
}
