import { Skeleton } from './Skeleton.jsx';

/**
 * Skeleton placeholder for a single proposal card.
 */
function ProposalCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <Skeleton width="3.5rem" height="1.25rem" borderRadius="999px" />
        <Skeleton width="60%" height="1.1rem" />
      </div>
      <Skeleton width="100%" height="0.8rem" />
      <Skeleton width="85%" height="0.8rem" />
      <div className="skeleton-card__row" style={{ marginTop: '0.5rem' }}>
        <Skeleton width="5rem" height="0.75rem" />
        <Skeleton width="5rem" height="0.75rem" />
        <Skeleton width="4rem" height="0.75rem" />
      </div>
      <Skeleton width="100%" height="0.4rem" borderRadius="2px" />
    </div>
  );
}

/**
 * Renders multiple proposal card skeletons.
 *
 * @param {{ count?: number }} props
 */
export function ProposalListSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }, (_, i) => (
        <ProposalCardSkeleton key={i} />
      ))}
    </div>
  );
}
