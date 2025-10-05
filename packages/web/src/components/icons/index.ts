/**
 * Icon components for wallet integrations
 */
import React from 'react';

export const XverseIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#F27A24" />
    <path
      d="M8 12H16M12 8V16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="10" stroke="#F27A24" strokeWidth="2" />
  </svg>
);

export const ChipiPayIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#10B981" />
    <rect x="6" y="9" width="12" height="6" rx="1" fill="white" />
    <circle cx="8" cy="12" r="1" fill="#10B981" />
    <circle cx="16" cy="12" r="1" fill="#10B981" />
    <path d="M10 12H14" stroke="#10B981" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const BitcoinIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#F7931A" />
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 7H16V9H14V11H16V13H14V15H16V17H13V16H11V17H8V15H10V13H8V11H10V9H8V7H11V8H13V7ZM11 9V11H13V9H11ZM11 13V15H13V13H11Z"
      fill="white"
    />
  </svg>
);

export const StarknetIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#6B46C1" />
    <path
      d="M12 4L4 8V16L12 20L20 16V8L12 4Z"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />
    <path d="M12 8L8 10V14L12 16L16 14V10L12 8Z" fill="white" />
  </svg>
);

export const LightningIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#FBB040" />
    <path
      d="M13 2L3 14H11L9 22L21 10H13L15 2Z"
      fill="white"
    />
  </svg>
);