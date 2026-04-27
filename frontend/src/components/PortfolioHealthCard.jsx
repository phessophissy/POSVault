import React, { useMemo } from 'react';

export default function PortfolioHealthCard({ userStats, pendingRewards, tokenBalance }) {
  const score = useMemo(() => {
    const deposited = Number(userStats?.['total-deposited']?.value || 0);
    const rewards = Number(userStats?.['total-rewards']?.value || 0);
    const pending = Number(pendingRewards || 0);
    const gov = Number(tokenBalance || 0);

    if (deposited <= 0) return 0;
    const rewardsRatio = Math.min(40, (rewards / deposited) * 100);
    const pendingRatio = Math.min(30, (pending / deposited) * 100);
    const governanceRatio = Math.min(30, (gov / deposited) * 100);
    return Math.round(rewardsRatio + pendingRatio + governanceRatio);
  }, [userStats, pendingRewards, tokenBalance]);

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-title">
        <div className="card-title-icon" style={{ background: 'rgba(46,204,113,0.15)' }}>🧠</div>
        Portfolio Health
      </div>
      <div className="portfolio-health-wrap">
        <div className="portfolio-health-bar">
          <div className="portfolio-health-fill" style={{ width: `${score}%` }} />
        </div>
        <strong>{score}/100</strong>
      </div>
      <p className="portfolio-health-copy">
        Score blends realized rewards, pending rewards, and governance token exposure.
      </p>
    </div>
  );
}
