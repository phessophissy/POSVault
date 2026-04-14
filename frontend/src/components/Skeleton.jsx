/**
 * Generic skeleton placeholder that pulses to indicate loading.
 * Renders a rectangular block with configurable width, height, and border-radius.
 *
 * @param {{ width?: string, height?: string, borderRadius?: string, className?: string }} props
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '6px',
  className = '',
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

/**
 * Renders multiple skeleton lines to simulate a text block.
 *
 * @param {{ lines?: number, gap?: string }} props
 */
export function SkeletonText({ lines = 3, gap = '0.5rem' }) {
  return (
    <div className="skeleton-text" style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height="0.875rem"
        />
      ))}
    </div>
  );
}

/**
 * Circle skeleton for avatar or icon placeholders.
 *
 * @param {{ size?: string }} props
 */
export function SkeletonCircle({ size = '2.5rem' }) {
  return <Skeleton width={size} height={size} borderRadius="50%" />;
}
