import React, { useEffect, useState } from 'react';

export default function TransactionToast({ txStatus, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (txStatus) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [txStatus, onDismiss]);

  if (!txStatus || !visible) return null;

  const isSuccess = txStatus.type === 'success';
  const isPending = txStatus.type === 'pending';

  return (
    <div className={`tx-toast tx-toast--${txStatus.type}`} role="alert">
      <div className="tx-toast__icon">
        {isSuccess ? '✓' : isPending ? '⏳' : '✗'}
      </div>
      <div className="tx-toast__content">
        <strong>{txStatus.title || (isSuccess ? 'Transaction Sent' : 'Transaction Failed')}</strong>
        <p>{txStatus.message}</p>
        {txStatus.txid && (
          <a
            href={`https://explorer.hiro.so/txid/${txStatus.txid}?chain=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-toast__link"
          >
            View on Explorer →
          </a>
        )}
      </div>
      <button className="tx-toast__close" onClick={() => { setVisible(false); onDismiss?.(); }}>×</button>
    </div>
  );
}
