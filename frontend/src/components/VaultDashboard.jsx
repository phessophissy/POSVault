import { useState, useEffect, useCallback } from 'react';

export function VaultDashboard({ stacksApi, deployer, contractName }) {
  const [vaultInfo, setVaultInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVaultInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${stacksApi}/v2/contracts/call-read/${deployer}/${contractName}/get-vault-info`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: deployer, arguments: [] }),
        }
      );
      const data = await response.json();
      setVaultInfo(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stacksApi, deployer, contractName]);

  useEffect(() => {
    fetchVaultInfo();
    const interval = setInterval(fetchVaultInfo, 30000);
    return () => clearInterval(interval);
  }, [fetchVaultInfo]);

  if (loading && !vaultInfo) return <div className="vault-loading">Loading vault data...</div>;
  if (error) return <div className="vault-error">Error: {error}</div>;

  return (
    <div className="vault-dashboard">
      <h2>Vault Overview</h2>
      <div className="vault-stats-grid">
        <StatCard label="Total STX Locked" value={vaultInfo?.totalStxLocked} unit="STX" />
        <StatCard label="Total Depositors" value={vaultInfo?.totalDepositors} />
        <StatCard label="Reward Rate" value={vaultInfo?.rewardRate} unit="bp" />
        <StatCard label="Status" value={vaultInfo?.isPaused ? 'Paused' : 'Active'} />
      </div>
      <button onClick={fetchVaultInfo} className="btn-refresh">Refresh</button>
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? '—'}{unit && ` ${unit}`}</span>
    </div>
  );
}
