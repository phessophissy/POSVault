import { useState, useEffect } from 'react';

export function UserPosition({ userAddress, stacksApi, deployer, contractName }) {
  const [deposit, setDeposit] = useState(null);
  const [pendingRewards, setPendingRewards] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) return;
    setLoading(true);

    Promise.all([
      fetchReadOnly(stacksApi, deployer, contractName, 'get-deposit', userAddress),
      fetchReadOnly(stacksApi, deployer, contractName, 'get-pending-rewards', userAddress),
    ])
      .then(([dep, rewards]) => {
        setDeposit(dep);
        setPendingRewards(rewards);
      })
      .finally(() => setLoading(false));
  }, [userAddress, stacksApi, deployer, contractName]);

  if (!userAddress) return <div className="user-position-empty">Connect wallet to view position</div>;
  if (loading) return <div className="user-position-loading">Loading position...</div>;

  return (
    <div className="user-position">
      <h3>Your Position</h3>
      <div className="position-details">
        <div className="position-row">
          <span>Deposited</span>
          <span>{deposit ? `${(Number(deposit.amount) / 1e6).toFixed(6)} STX` : 'None'}</span>
        </div>
        <div className="position-row">
          <span>Pending Rewards</span>
          <span>{pendingRewards ? `${(Number(pendingRewards) / 1e6).toFixed(6)} POS-GOV` : '0'}</span>
        </div>
        <div className="position-row">
          <span>Total Claimed</span>
          <span>{deposit ? `${(Number(deposit.totalRewardsClaimed) / 1e6).toFixed(6)} POS-GOV` : '0'}</span>
        </div>
      </div>
    </div>
  );
}

async function fetchReadOnly(api, deployer, contract, fn, sender) {
  try {
    const res = await fetch(`${api}/v2/contracts/call-read/${deployer}/${contract}/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, arguments: [] }),
    });
    return await res.json();
  } catch {
    return null;
  }
}
