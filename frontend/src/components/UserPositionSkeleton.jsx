import { Skeleton, SkeletonCircle } from './Skeleton.jsx';

/**
 * Skeleton placeholder for the user position / portfolio section.
 */
export function UserPositionSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <SkeletonCircle size="2.5rem" />
        <div style={{ flex: 1 }}>
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="12rem" height="0.75rem" className="mt-xs" />
        </div>
      </div>
      <div className="skeleton-card__body">
        <div className="skeleton-card__row">
          <Skeleton width="6rem" height="0.8rem" />
          <Skeleton width="5rem" height="0.8rem" />
        </div>
        <div className="skeleton-card__row">
          <Skeleton width="7rem" height="0.8rem" />
          <Skeleton width="4rem" height="0.8rem" />
        </div>
        <div className="skeleton-card__row">
          <Skeleton width="9rem" height="0.8rem" />
          <Skeleton width="3.5rem" height="0.8rem" />
        </div>
      </div>
      <Skeleton width="100%" height="2.5rem" borderRadius="8px" />
    </div>
  );
}
