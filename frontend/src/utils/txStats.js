/**
 * Compute aggregate stats from a list of raw transactions.
 *
 * @param {Array<object>} transactions  Raw API transaction objects
 * @returns {{ total: number, confirmed: number, pending: number, failed: number, contractCalls: number, transfers: number, totalFees: number }}
 */
export function computeTxStats(transactions) {
  let confirmed = 0;
  let pending = 0;
  let failed = 0;
  let contractCalls = 0;
  let transfers = 0;
  let totalFees = 0;

  for (const tx of transactions) {
    // Status counters
    if (tx.tx_status === 'success') confirmed++;
    else if (tx.tx_status === 'pending') pending++;
    else failed++;

    // Type counters
    if (tx.tx_type === 'contract_call') contractCalls++;
    if (tx.tx_type === 'token_transfer') transfers++;

    // Accumulate fees
    if (tx.fee_rate) totalFees += Number(tx.fee_rate);
  }

  return {
    total: transactions.length,
    confirmed,
    pending,
    failed,
    contractCalls,
    transfers,
    totalFees,
  };
}
