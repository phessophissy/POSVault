import { useState, useEffect, useCallback } from 'react';

export function responsive-mobile_8({ config, onAction }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!config?.apiUrl) return;
    setLoading(true);
    try {
      const res = await fetch(config.apiUrl);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [config?.apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="responsive-mobile-8">
      <h4>Component 8</h4>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => onAction?.('action-8')}>Action 8</button>
    </div>
  );
}
