import React from 'react';

export function EmptyStateVector({ type = "sessions", className = "w-32 h-32 mx-auto" }) {
  if (type === "mic") {
    return (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <circle cx="60" cy="60" r="50" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" />
        <rect x="52" y="38" width="16" height="26" rx="8" stroke="#EF4444" strokeWidth="2" />
        <path d="M44 54 C44 64 76 64 76 54" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="64" x2="60" y2="76" stroke="#EF4444" strokeWidth="2" />
        <line x1="40" y1="40" x2="80" y2="80" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "offline") {
    return (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <circle cx="60" cy="60" r="50" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.3)" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="60" cy="60" r="14" stroke="#F59E0B" strokeWidth="2" />
        <path d="M40 40 A 30 30 0 0 1 80 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
        <path d="M30 30 A 44 44 0 0 1 90 30" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  // Default: no sessions
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="50" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
      <rect x="42" y="36" width="36" height="48" rx="6" stroke="#22D3EE" strokeWidth="2" />
      <line x1="50" y1="50" x2="70" y2="50" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="60" x2="66" y2="60" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="70" x2="58" y2="70" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
