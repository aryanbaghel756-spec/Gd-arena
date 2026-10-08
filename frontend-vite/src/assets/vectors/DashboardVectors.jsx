import React from 'react';

export function VoiceActivityVector({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" fill="rgba(34,211,238,0.1)" stroke="#22D3EE" strokeWidth="1.5" />
      <rect x="12" y="15" width="2.5" height="10" rx="1.2" fill="#22D3EE" />
      <rect x="17" y="10" width="2.5" height="20" rx="1.2" fill="#22D3EE" />
      <rect x="22" y="13" width="2.5" height="14" rx="1.2" fill="#8B5CF6" />
      <rect x="27" y="16" width="2.5" height="8" rx="1.2" fill="#8B5CF6" />
    </svg>
  );
}

export function AiAnalysisVector({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" fill="rgba(139,92,246,0.1)" stroke="#8B5CF6" strokeWidth="1.5" />
      <circle cx="15" cy="16" r="3" fill="#8B5CF6" />
      <circle cx="25" cy="16" r="3" fill="#8B5CF6" />
      <circle cx="20" cy="26" r="3" fill="#22D3EE" />
      <line x1="15" y1="16" x2="25" y2="16" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="15" y1="16" x2="20" y2="26" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="25" y1="16" x2="20" y2="26" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
}

export function ScoreGaugeVector({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.5" />
      <path d="M12 24 A 10 10 0 1 1 28 24" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24 A 10 10 0 1 1 26 14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2.5" fill="#10B981" />
      <line x1="20" y1="20" x2="24" y2="15" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DiscussionAnalyticsVector({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" strokeWidth="1.5" />
      <path d="M12 26 L17 19 L23 23 L28 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="14" r="2.5" fill="#F59E0B" />
    </svg>
  );
}
