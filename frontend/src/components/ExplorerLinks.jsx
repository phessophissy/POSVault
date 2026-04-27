import React from 'react';

export default function ExplorerLinks({ contractPrincipal }) {
  const base = 'https://explorer.hiro.so';
  const encoded = encodeURIComponent(contractPrincipal || '');
  const contractUrl = `${base}/txid/${encoded}?chain=mainnet`;

  return (
    <div className="explorer-links">
      <a href={base} target="_blank" rel="noreferrer">Hiro Explorer</a>
      <a href={contractUrl} target="_blank" rel="noreferrer">Vault Principal</a>
    </div>
  );
}
