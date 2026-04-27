import React from 'react';

function Stat({ label, value }) {
  return (
    <div className="mini-kpi-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function MiniKpiStrip({ values }) {
  return (
    <div className="mini-kpi-strip">
      <Stat label="Locked" value={values.locked} />
      <Stat label="Reward Rate" value={values.rewardRate} />
      <Stat label="Supply" value={values.supply} />
      <Stat label="Your Pending" value={values.pending} />
    </div>
  );
}
