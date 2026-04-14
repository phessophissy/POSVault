import { VaultStatsSkeleton } from './VaultStatsSkeleton.jsx';
import { DepositFormSkeleton } from './DepositFormSkeleton.jsx';
import { UserPositionSkeleton } from './UserPositionSkeleton.jsx';
import { ProposalListSkeleton } from './ProposalListSkeleton.jsx';
import { TransactionListSkeleton } from './TransactionListSkeleton.jsx';

/**
 * Full-page skeleton that matches the main dashboard layout.
 * Used while initial data is loading after wallet connection.
 */
export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <VaultStatsSkeleton />
        <UserPositionSkeleton />
      </div>
      <DepositFormSkeleton />
    </div>
  );
}

/**
 * Full-page skeleton for the governance tab.
 */
export function GovernanceSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <ProposalListSkeleton count={4} />
    </div>
  );
}

/**
 * Full-page skeleton for the transaction history tab.
 */
export function HistorySkeleton() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <TransactionListSkeleton rows={8} />
    </div>
  );
}
