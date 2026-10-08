import React, { useState, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';

export function HeroArenaVisual() {
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0);

  const participants = [
    { id: 'you', name: 'YOU', role: 'Student', color: '#38bdf8', letter: 'U', angle: -90, quote: 'AI will augment human capabilities rather than simply replace them.' },
    { id: 'moderator', name: 'MODERATOR', role: 'Facilitator', color: '#a855f7', letter: 'M', angle: -38, quote: 'Let us keep our arguments concise and evidence-backed.' },
    { id: 'aarav', name: 'AARAV', role: 'Analyst', color: '#3b82f6', letter: 'A', angle: 14, quote: 'Productivity metrics show automated workflows generate net new roles.' },
    { id: 'meera', name: 'MEERA', role: 'Creative', color: '#ec4899', letter: 'M', angle: 66, quote: 'Creative inquiry and emotional intelligence remain deeply human.' },
    { id: 'kabir', name: 'KABIR', role: 'Critic', color: '#f97316', letter: 'K', angle: 118, quote: 'Who absorbs the acute downside risk during rapid displacement?' },
    { id: 'ananya', name: 'ANANYA', role: 'Collaborator', color: '#10b981', letter: 'N', angle: 170, quote: 'Building on Aarav and Meera, progressive upskilling bridges this gap.' },
    { id: 'rohan', name: 'ROHAN', role: 'Debater', color: '#eab308', letter: 'R', angle: 222, quote: 'First-mover advantage dictates which organizations will thrive.' },
  ];

  // Rotate active speaker automatically every 3.2s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSpeakerIdx(prev => (prev + 1) % participants.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [participants.length]);

  const activeSpeaker = participants[activeSpeakerIdx];

  // Geometry dimensions
  const center = { x: 260, y: 220 };
  const radiusX = 195;
  const radiusY = 155;

  return (
    <div className="relative w-full max-w-[540px] aspect-[520/440] mx-auto select-none">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at center, ${activeSpeaker.color} 0%, rgba(244, 63, 94, 0.15) 50%, transparent 80%)`,
        }}
      />

      {/* SVG Canvas for lines, rings, and hexagonal background */}
      <svg viewBox="0 0 520 440" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={activeSpeaker.color} stopOpacity="0.4" />
            <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Guide Ellipse */}
        <ellipse
          cx={center.x}
          cy={center.y}
          rx={radiusX}
          ry={radiusY}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeDasharray="4 8"
          strokeWidth="1.2"
        />

        {/* Pulse rings around center */}
        <circle
          cx={center.x}
          cy={center.y}
          r="80"
          fill="none"
          stroke={activeSpeaker.color}
          strokeOpacity="0.15"
          strokeWidth="1"
          className="animate-ping-slow origin-center"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r="54"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />

        {/* Connecting Lines between center and each participant */}
        {participants.map((p, idx) => {
          const rad = (p.angle * Math.PI) / 180;
          const px = center.x + radiusX * Math.cos(rad);
          const py = center.y + radiusY * Math.sin(rad);
          const isActive = idx === activeSpeakerIdx;

          return (
            <g key={p.id}>
              <line
                x1={center.x}
                y1={center.y}
                x2={px}
                y2={py}
                stroke={isActive ? p.color : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isActive ? '2' : '1'}
                strokeDasharray={isActive ? 'none' : '3 6'}
                strokeOpacity={isActive ? 0.8 : 0.35}
                className="transition-all duration-500"
              />
              {/* Traveling energy photon if active */}
              {isActive && (
                <circle
                  cx={center.x + (px - center.x) * 0.65}
                  cy={center.y + (py - center.y) * 0.65}
                  r="3.5"
                  fill={p.color}
                  className="animate-ping"
                />
              )}
            </g>
          );
        })}

        {/* Central Energy Core */}
        <circle
          cx={center.x}
          cy={center.y}
          r="46"
          fill="url(#coreGlow)"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r="34"
          fill="#0c0d14"
          stroke={activeSpeaker.color}
          strokeWidth="1.8"
          filter="url(#softGlow)"
          className="transition-colors duration-500"
        />

        {/* Central Core Waveform Visualizer */}
        <g transform={`translate(${center.x - 16}, ${center.y - 12})`}>
          <rect x="2" y="6" width="3" height="12" rx="1.5" fill={activeSpeaker.color} className="animate-waveform" style={{ animationDelay: '0ms' }} />
          <rect x="8" y="2" width="3" height="20" rx="1.5" fill={activeSpeaker.color} className="animate-waveform" style={{ animationDelay: '150ms' }} />
          <rect x="14" y="8" width="3" height="10" rx="1.5" fill={activeSpeaker.color} className="animate-waveform" style={{ animationDelay: '300ms' }} />
          <rect x="20" y="4" width="3" height="16" rx="1.5" fill={activeSpeaker.color} className="animate-waveform" style={{ animationDelay: '100ms' }} />
          <rect x="26" y="7" width="3" height="11" rx="1.5" fill={activeSpeaker.color} className="animate-waveform" style={{ animationDelay: '250ms' }} />
        </g>
      </svg>

      {/* HTML Participant Nodes Floating on Coordinates */}
      {participants.map((p, idx) => {
        const rad = (p.angle * Math.PI) / 180;
        // Convert to percentage position
        const leftPct = ((center.x + radiusX * Math.cos(rad)) / 520) * 100;
        const topPct = ((center.y + radiusY * Math.sin(rad)) / 440) * 100;
        const isActive = idx === activeSpeakerIdx;

        return (
          <div
            key={p.id}
            onClick={() => setActiveSpeakerIdx(idx)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            {/* Active Speaker Badge Pill */}
            {isActive && (
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border shadow-lg animate-in fade-in duration-300 z-20 flex items-center gap-1"
                style={{
                  backgroundColor: `${p.color}20`,
                  color: p.color,
                  borderColor: `${p.color}60`,
                  boxShadow: `0 0 14px ${p.color}40`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                SPEAKING
              </div>
            )}

            {/* Persona Avatar Node */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-heading font-extrabold text-xs transition-all duration-300 relative ${
                isActive
                  ? 'scale-110 shadow-lg'
                  : 'bg-arena-elevated/90 text-slate-400 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? '#0e111a' : undefined,
                borderColor: isActive ? p.color : undefined,
                borderWidth: isActive ? '1.8px' : '1px',
                color: isActive ? '#ffffff' : undefined,
                boxShadow: isActive ? `0 0 20px ${p.color}50, inset 0 0 10px ${p.color}20` : undefined,
              }}
            >
              {p.letter}
              {p.id === 'you' && (
                <Mic size={10} className="absolute -bottom-1 -right-1 text-sky-400 bg-sky-950 rounded-full p-0.5 border border-sky-400/40" />
              )}
            </div>

            {/* Label below node */}
            <div className="text-center mt-1">
              <span
                className={`text-[11px] font-bold tracking-tight block ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {p.name}
              </span>
              <span className="text-[9px] text-slate-400 block -mt-0.5">{p.role}</span>
            </div>
          </div>
        );
      })}

      {/* Floating Active Dialogue Snippet Card below visual */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-2.5 px-4 rounded-xl bg-arena-surface/90 border border-white/10 shadow-xl backdrop-blur-md flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
          style={{ backgroundColor: activeSpeaker.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider font-mono" style={{ color: activeSpeaker.color }}>
              {activeSpeaker.name} ({activeSpeaker.role})
            </span>
          </div>
          <p className="text-xs text-slate-200 truncate italic">
            "{activeSpeaker.quote}"
          </p>
        </div>
      </div>
    </div>
  );
}
