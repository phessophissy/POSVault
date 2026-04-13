/**
 * Filter bar for the transaction history view.
 * Allows filtering by tx type and status.
 */
export function TransactionFilters({
  typeFilter,
  statusFilter,
  onTypeChange,
  onStatusChange,
}) {
  return (
    <div className="tx-filters">
      <label className="tx-filters__label">
        Type
        <select
          className="tx-filters__select"
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="contract_call">Contract Calls</option>
          <option value="token_transfer">Token Transfers</option>
          <option value="smart_contract">Deployments</option>
        </select>
      </label>

      <label className="tx-filters__label">
        Status
        <select
          className="tx-filters__select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="success">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </label>
    </div>
  );
}
