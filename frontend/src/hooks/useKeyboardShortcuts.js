import { useEffect } from 'react';

export default function useKeyboardShortcuts({ onRefresh, onTab }) {
  useEffect(() => {
    const handler = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'r') onRefresh?.();
      if (key === 'v') onTab?.('vault');
      if (key === 'g') onTab?.('governance');
      if (key === 'p') onTab?.('portfolio');
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRefresh, onTab]);
}
