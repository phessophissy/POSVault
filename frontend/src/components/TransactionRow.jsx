import { useState } from 'react';
import {
  shortenTxId,
  formatTxStatus,
  statusClass,
  formatTxType,
  extractFunctionName,
  formatMicroStx,
  explorerUrl,
} from '../utils/txFormatters.js';

/**
 * Renders a single transaction row with expandable details.
 * @param {{ tx: object, network?: string }} props
 */
export function TransactionRow({ tx, network = 'mainnet' }) {
  const [expanded, setExpanded] = useState(false);

  const fnName = extractFunctionName(tx);
  const fee = tx.fee_rate ? formatMicroStx(tx.fee_rate) : null;
  const timestamp = tx.burn_block_time
    ? new Date(tx.burn_block_time * 1000).toLocaleString()
    : null;

  return (
    <li className={`tx-row tx-row--${statusClass(tx.tx_status)}`}>
      <div
        className="tx-row__summary"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        <span className={`tx-badge tx-badge--${statusClass(tx.tx_status)}`}>
          {formatTxStatus(tx.tx_status)}
        </span>
        <span className="tx-row__type">{formatTxType(tx.tx_type)}</span>
        {fnName && <span className="tx-row__fn">{fnName}</span>}
        <a
          href={explorerUrl(tx.tx_id, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="tx-row__id"
          onClick={(e) => e.stopPropagation()}
        >
          {shortenTxId(tx.tx_id)}
        </a>
        <span className="tx-row__expand">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="tx-row__details">
          <dl>
            <dt>Transaction ID</dt>
            <dd>
              <code>{tx.tx_id}</code>
            </dd>

            {timestamp && (
              <>
                <dt>Time</dt>
                <dd>{timestamp}</dd>
              </>
            )}

            {fee && (
              <>
                <dt>Fee</dt>
                <dd>{fee}</dd>
              </>
            )}

            {tx.tx_type === 'contract_call' && tx.contract_call && (
              <>
                <dt>Contract</dt>
                <dd>
                  <code>{tx.contract_call.contract_id}</code>
                </dd>
              </>
            )}

            {tx.tx_type === 'token_transfer' && tx.token_transfer && (
              <>
                <dt>Recipient</dt>
                <dd>
                  <code>{tx.token_transfer.recipient_address}</code>
                </dd>
                <dt>Amount</dt>
                <dd>{formatMicroStx(tx.token_transfer.amount)}</dd>
              </>
            )}

            <dt>Block</dt>
            <dd>{tx.block_height ?? 'Pending'}</dd>

            <dt>Nonce</dt>
            <dd>{tx.nonce}</dd>
          </dl>
        </div>
      )}
    </li>
  );
}
