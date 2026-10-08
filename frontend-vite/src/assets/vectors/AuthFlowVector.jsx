import React from 'react';

/**
 * Custom SVG Vector: Abstract Data Flow
 * Student Microphone ➔ Waveform ➔ AI Processing Nodes ➔ Feedback Analytics Graph
 */
export function AuthFlowVector({ className = "w-full h-auto" }) {
  return (
    <svg
      viewBox="0 0 500 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Speech to Feedback Flow Diagram"
    >
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Connection Flow Ray */}
      <path
        d="M80 180 C 140 180, 160 120, 240 120 C 310 120, 340 220, 420 220"
        stroke="url(#flowGrad)"
        strokeWidth="3"
        strokeDasharray="4 4"
      />

      {/* 1. Student Microphone Node */}
      <g transform="translate(80, 180)">
        <circle cx="0" cy="0" r="34" fill="#0E1626" stroke="#22D3EE" strokeWidth="2" />
        <rect x="-7" y="-14" width="14" height="20" rx="7" fill="#22D3EE" />
        <path d="M-12 -2 C-12 7 12 7 12 -2" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="9" x2="0" y2="15" stroke="#22D3EE" strokeWidth="2" />
        <text x="0" y="50" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">Voice Input</text>
      </g>

      {/* 2. Waveform Stage */}
      <g transform="translate(160, 150)">
        <circle cx="0" cy="0" r="18" fill="#0A0E1A" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="-8" y="-6" width="2" height="12" fill="#22D3EE" />
        <rect x="-3" y="-10" width="2" height="20" fill="#22D3EE" />
        <rect x="2" y="-4" width="2" height="8" fill="#22D3EE" />
        <rect x="7" y="-8" width="2" height="16" fill="#8B5CF6" />
      </g>

      {/* 3. AI Neural Processing Node */}
      <g transform="translate(240, 120)">
        <circle cx="0" cy="0" r="32" fill="#0E1626" stroke="#8B5CF6" strokeWidth="2.5" />
        <circle cx="-10" cy="-6" r="4" fill="#8B5CF6" />
        <circle cx="10" cy="-6" r="4" fill="#8B5CF6" />
        <circle cx="0" cy="8" r="4" fill="#22D3EE" />
        <line x1="-10" y1="-6" x2="10" y2="-6" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="-10" y1="-6" x2="0" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="10" y1="-6" x2="0" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <text x="0" y="48" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">AI Personas</text>
      </g>

      {/* 4. Intermediate Transition Wave */}
      <g transform="translate(330, 170)">
        <circle cx="0" cy="0" r="14" fill="#0A0E1A" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <path d="M-8 0 Q-4 -6 0 0 T8 0" stroke="#8B5CF6" strokeWidth="2" fill="none" />
      </g>

      {/* 5. Feedback Analytics Graph */}
      <g transform="translate(420, 220)">
        <circle cx="0" cy="0" r="34" fill="#0E1626" stroke="#10B981" strokeWidth="2" />
        {/* Mini Radar / Bar chart */}
        <path d="M-14 10 L-8 2 L0 6 L8 -8 L14 -4" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="-4" r="3" fill="#10B981" />
        <text x="0" y="50" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">Audit Report</text>
      </g>
    </svg>
  );
}
