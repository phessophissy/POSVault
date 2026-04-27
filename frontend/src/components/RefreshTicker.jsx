import React, { useEffect, useMemo, useState } from 'react';

export default function RefreshTicker({ intervalMs = 30000, onRefresh, className = '' }) {
  const [remainingMs, setRemainingMs] = useState(intervalMs);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    setRemainingMs(intervalMs);
  }, [intervalMs]);

  useEffect(() => {
    const onVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setInterval(() => {
      setRemainingMs(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          if (typeof onRefresh === 'function') onRefresh();
          return intervalMs;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [intervalMs, onRefresh, isVisible]);

  const seconds = useMemo(() => Math.max(0, Math.floor(remainingMs / 1000)), [remainingMs]);

  return (
    <div className={`refresh-ticker ${className}`.trim()}>
      <span className="refresh-ticker-dot" />
      <span>{isVisible ? `Next sync in ${seconds}s` : 'Sync paused in background tab'}</span>
    </div>
  );
}
