import React from 'react';

export default function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeMap = { small: 20, medium: 40, large: 60 };
  const dim = sizeMap[size] || sizeMap.medium;

  return (
    <div className="loading-spinner" role="status" aria-label={text}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 50 50"
        className="spinner-svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="80"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
}
