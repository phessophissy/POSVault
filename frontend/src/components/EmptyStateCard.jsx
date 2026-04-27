import React from 'react';

export default function EmptyStateCard({ icon, title, body, action }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-body">{body}</p>
      {action}
    </div>
  );
}
