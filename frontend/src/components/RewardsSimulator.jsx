import React, { useMemo } from 'react';
import { clamp, percentage, projectRewards } from '../utils/math.js';

export default function RewardsSimulator({
  amountStx,
  rewardRateBps,
  cycles,
  onAmountChange,
  onCyclesChange,
  blocksPerCycle = 144,
  averageBlockMinutes = 10,
}) {
  const projected = useMemo(
    () => projectRewards(amountStx, rewardRateBps, cycles),
    [amountStx, rewardRateBps, cycles]
  );

  const roi = useMemo(() => percentage(projected, amountStx), [projected, amountStx]);
  const projectedTotal = useMemo(() => Number(amountStx || 0) + projected, [amountStx, projected]);
  const estimatedDays = useMemo(
    () => ((blocksPerCycle * cycles * averageBlockMinutes) / 60 / 24),
    [blocksPerCycle, cycles, averageBlockMinutes]
  );

  return (
    <div className="sim-card">
      <div className="sim-header">
        <h3>Yield Simulator</h3>
        <span>What-if planner</span>
      </div>

      <label className="sim-label">Deposit (STX)</label>
      <input
        className="form-input"
        type="number"
        min="0"
        step="0.01"
        value={amountStx}
        onChange={(event) => onAmountChange(Number(event.target.value || 0))}
      />

      <label className="sim-label">Cycles ({cycles})</label>
      <input
        type="range"
        min="1"
        max="30"
        value={clamp(cycles, 1, 30)}
        onChange={(event) => onCyclesChange(Number(event.target.value))}
      />

      <div className="sim-stats">
        <div>
          <span>Projected Rewards</span>
          <strong>{projected.toFixed(4)} POS-GOV</strong>
        </div>
        <div>
          <span>Estimated ROI</span>
          <strong>{roi.toFixed(2)}%</strong>
        </div>
        <div>
          <span>Projected Total</span>
          <strong>{projectedTotal.toFixed(4)} STX</strong>
        </div>
        <div>
          <span>Estimated Time</span>
          <strong>{estimatedDays.toFixed(1)} days</strong>
        </div>
      </div>
    </div>
  );
}
