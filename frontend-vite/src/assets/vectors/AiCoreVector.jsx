import React from 'react';

export function AiCoreVector({ size = 48, className = "" }) {
  return (
    <div style={{ width: size, height: size }} className={elative flex items-center justify-center }>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="rgba(34,211,238,0.25)" strokeWidth="2" strokeDasharray="4 6" className="animate-spin-slow origin-center" />
        <circle cx="50" cy="50" r="36" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeDasharray="3 4" className="animate-spin-reverse origin-center" />
        <circle cx="50" cy="50" r="22" fill="#0A0E1A" stroke="#22D3EE" strokeWidth="2" />
        <circle cx="50" cy="50" r="10" fill="url(#coreGradIcon)" />
        <defs>
          <linearGradient id="coreGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
