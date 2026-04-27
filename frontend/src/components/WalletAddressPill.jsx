import React from 'react';
import { shortHash } from '../utils/hash.js';

export default function WalletAddressPill({ address }) {
  if (!address) return null;

  return (
    <div className="wallet-address-pill" title={address}>
      <span>Address</span>
      <strong>{shortHash(address, 8, 6)}</strong>
    </div>
  );
}
