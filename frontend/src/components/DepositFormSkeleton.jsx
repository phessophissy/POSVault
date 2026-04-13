import { Skeleton, SkeletonText } from './Skeleton.jsx';

/**
 * Skeleton placeholder for the deposit form while wallet/vault data loads.
 */
export function DepositFormSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton width="8rem" height="1.25rem" />
      <div style={{ marginTop: '0.75rem' }}>
        <Skeleton width="100%" height="2.5rem" borderRadius="8px" />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <Skeleton width="12rem" height="0.75rem" />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Skeleton width="100%" height="2.75rem" borderRadius="8px" />
      </div>
    </div>
  );
}
