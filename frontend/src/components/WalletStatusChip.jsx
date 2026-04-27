import React from 'react';

function shortAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletStatusChip({ wallet }) {
  const connected = Boolean(wallet?.address);

  return (
    <div className={`wallet-status-chip ${connected ? 'wallet-status-connected' : 'wallet-status-disconnected'}`}>
      <span className="wallet-status-dot" />
      <span>{connected ? `Wallet ${shortAddress(wallet.address)}` : 'Wallet not connected'}</span>
    </div>
  );
}
