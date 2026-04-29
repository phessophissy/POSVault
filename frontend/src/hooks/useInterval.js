import { useEffect, useRef } from 'react';

export default function useInterval(callback, delay) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}
export const useBatch1 = () => { return React.useContext(Batch1Context); };
export const useBatch4 = () => { return React.useContext(Batch4Context); };
