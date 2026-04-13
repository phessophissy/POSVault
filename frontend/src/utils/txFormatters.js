/**
 * Format a raw transaction object from the Hiro API into a
 * display-friendly shape.
 */

/**
 * Truncate a tx_id for display: "0xabc...xyz"
 * @param {string} txId
 * @param {number} chars  Number of chars to keep on each side
 */
export function shortenTxId(txId, chars = 6) {
  if (!txId) return '';
  if (txId.length <= chars * 2 + 3) return txId;
  return `${txId.slice(0, chars + 2)}…${txId.slice(-chars)}`;
}

/**
 * Map raw tx_status values to human-readable labels.
 * @param {string} status
 */
export function formatTxStatus(status) {
  const map = {
    success: 'Confirmed',
    pending: 'Pending',
    abort_by_response: 'Failed',
    abort_by_post_condition: 'Post-condition Failed',
  };
  return map[status] ?? status;
}

/**
 * Return a CSS-friendly class suffix for a status.
 * @param {string} status
 */
export function statusClass(status) {
  if (status === 'success') return 'success';
  if (status === 'pending') return 'pending';
  return 'failed';
}

/**
 * Map tx_type to a readable label.
 * @param {string} txType
 */
export function formatTxType(txType) {
  const map = {
    contract_call: 'Contract Call',
    token_transfer: 'Token Transfer',
    smart_contract: 'Deploy',
    coinbase: 'Coinbase',
    poison_microblock: 'Poison Microblock',
  };
  return map[txType] ?? txType;
}

/**
 * Extract the function name from a contract_call transaction.
 * @param {object} tx  Raw transaction object from the API.
 */
export function extractFunctionName(tx) {
  if (tx.tx_type !== 'contract_call') return null;
  return tx.contract_call?.function_name ?? null;
}

/**
 * Format a micro-STX amount (number) to a human-readable STX string.
 * @param {number|string} microStx
 */
export function formatMicroStx(microStx) {
  const num = Number(microStx);
  if (Number.isNaN(num)) return '0 STX';
  return `${(num / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} STX`;
}

/**
 * Build the explorer URL for a given tx_id.
 * @param {string} txId
 * @param {'mainnet'|'testnet'} network
 */
export function explorerUrl(txId, network = 'mainnet') {
  const base = 'https://explorer.hiro.so';
  return `${base}/txid/${txId}?chain=${network}`;
}
