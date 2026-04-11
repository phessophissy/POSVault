import React from 'react';
import { formatAddress } from './stacks.js';

export default function WalletButton({ wallet, onConnect, onDisconnect }) {
  if (wallet) {
    return (
      <div className="wallet-connected">
        <span className="wallet-indicator" />
        <span className="wallet-address" title={wallet}>
          {formatAddress(wallet)}
        </span>
        <button className="btn btn--outline btn--sm" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button className="btn btn--primary" onClick={onConnect}>
      Connect Wallet
    </button>
  );
}
