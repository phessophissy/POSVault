import { useState, useEffect, useCallback } from 'react';

export function frontend-notifications_2({ config, onAction }) {
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
    <div className="frontend-notifications-2">
      <h4>Component 2</h4>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => onAction?.('action-2')}>Action 2</button>
    </div>
  );
}
