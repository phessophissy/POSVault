import { Skeleton } from './Skeleton.jsx';

/**
 * Skeleton placeholder for a transaction history list.
 *
 * @param {{ rows?: number }} props
 */
export function TransactionListSkeleton({ rows = 5 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <Skeleton width="12rem" height="1.25rem" />
        <div style={{ marginLeft: 'auto' }}>
          <Skeleton width="2rem" height="2rem" borderRadius="6px" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Skeleton width="8rem" height="2rem" borderRadius="6px" />
        <Skeleton width="8rem" height="2rem" borderRadius="6px" />
      </div>

      {/* Transaction rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Skeleton width="4.5rem" height="1.25rem" borderRadius="999px" />
            <Skeleton width="6rem" height="0.85rem" />
            <div style={{ marginLeft: 'auto' }}>
              <Skeleton width="5rem" height="0.8rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
