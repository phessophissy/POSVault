import { useCallback, useRef } from 'react';

export default function useRefreshGuard() {
  const inFlightRef = useRef(false);

  const withGuard = useCallback(async (fn) => {
    if (inFlightRef.current) return false;
    inFlightRef.current = true;
    try {
      await fn();
      return true;
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  return withGuard;
}
