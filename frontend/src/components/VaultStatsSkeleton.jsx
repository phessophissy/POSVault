import { Skeleton, SkeletonText } from './Skeleton.jsx';

/**
 * Skeleton placeholder for the vault stats cards.
 * Mimics the layout of VaultStats while data is loading.
 */
export function VaultStatsSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <Skeleton width="10rem" height="1.5rem" />
      </div>
      <div className="skeleton-card__body">
        <div className="skeleton-card__row">
          <Skeleton width="6rem" height="0.875rem" />
          <Skeleton width="4rem" height="0.875rem" />
        </div>
        <div className="skeleton-card__row">
          <Skeleton width="7rem" height="0.875rem" />
          <Skeleton width="3rem" height="0.875rem" />
        </div>
        <div className="skeleton-card__row">
          <Skeleton width="5rem" height="0.875rem" />
          <Skeleton width="5rem" height="0.875rem" />
        </div>
        <div className="skeleton-card__row">
          <Skeleton width="8rem" height="0.875rem" />
          <Skeleton width="3.5rem" height="0.875rem" />
        </div>
      </div>
    </div>
  );
}
