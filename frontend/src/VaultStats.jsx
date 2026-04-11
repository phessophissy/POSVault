import React from 'react';
import { formatSTX, formatNumber } from './stacks.js';

export default function VaultStats({ vaultInfo, totalSupply }) {
  if (!vaultInfo) return null;

  const stats = [
    { label: 'Total STX Locked', value: formatSTX(vaultInfo.totalStxLocked), unit: 'STX' },
    { label: 'Active Depositors', value: formatNumber(vaultInfo.totalDepositors) },
    { label: 'Reward Rate', value: `${vaultInfo.rewardRate} bps`, tooltip: 'Basis points per reward cycle (144 blocks)' },
    { label: 'POS-GOV Supply', value: formatNumber(totalSupply / 1000000), unit: 'tokens' },
    { label: 'Vault Status', value: vaultInfo.isPaused ? 'Paused' : 'Active', className: vaultInfo.isPaused ? 'status--paused' : 'status--active' },
  ];

  return (
    <div className="vault-stats-grid">
      {stats.map(({ label, value, unit, tooltip, className }) => (
        <div key={label} className="stat-card" title={tooltip}>
          <span className="stat-label">{label}</span>
          <span className={`stat-value ${className || ''}`}>
            {value}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}
