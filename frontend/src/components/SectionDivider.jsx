import React from 'react';

export default function SectionDivider({ label }) {
  return (
    <div className="section-divider" role="separator" aria-label={label || 'section divider'}>
      <span>{label}</span>
    </div>
  );
}
