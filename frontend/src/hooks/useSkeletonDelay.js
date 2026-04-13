import { useState, useEffect } from 'react';

/**
 * Hook that returns true until a minimum delay has passed AND
 * the actual loading state is false. Prevents skeleton flash
 * for fast loads while ensuring the skeleton appears for at
 * least `minDurationMs` to avoid layout jank.
 *
 * @param {boolean} isLoading  The real loading state
 * @param {number} minDurationMs  Minimum time to show skeleton (default: 400ms)
 * @returns {boolean} Whether the skeleton should be displayed
 */
export function useSkeletonDelay(isLoading, minDurationMs = 400) {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [loadStart] = useState(() => Date.now());

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      return;
    }

    // Data loaded — wait for minimum duration before hiding skeleton
    const elapsed = Date.now() - loadStart;
    const remaining = Math.max(0, minDurationMs - elapsed);

    if (remaining === 0) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => setShowSkeleton(false), remaining);
    return () => clearTimeout(timer);
  }, [isLoading, minDurationMs, loadStart]);

  return showSkeleton;
}
