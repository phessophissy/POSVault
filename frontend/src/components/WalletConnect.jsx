import { useState } from 'react';

export function WalletConnect({ onConnect, onDisconnect, userSession, userAddress }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect();
    } finally {
      setConnecting(false);
    }
  };

  if (userAddress) {
    const shortAddr = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    return (
      <div className="wallet-connected">
        <span className="wallet-address" title={userAddress}>{shortAddr}</span>
        <button className="btn-disconnect" onClick={onDisconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button className="btn-connect" onClick={handleConnect} disabled={connecting}>
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
