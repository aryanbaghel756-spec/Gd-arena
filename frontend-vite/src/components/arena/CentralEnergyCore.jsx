import React from 'react';

/**
 * CentralEnergyCore
 * The signature visual identity of GD Arena.
 * States:
 * - AI SPEAKING: pulse expands outward in electric magenta/violet
 * - USER SPEAKING: bright electric sky blue / cyan accent energy
 * - LISTENING: small rhythmic circular waves
 * - PROCESSING: rotating subtle ring
 * - INTERRUPTED: short warning amber/red pulse and instant transition
 */
export function CentralEnergyCore({
  state = 'listening', // 'ai_speaking' | 'user_speaking' | 'listening' | 'processing' | 'interrupted'
  activeSpeakerName = '',
  activeColor = '#f43f5e',
}) {
  let primaryColor = '#f43f5e';
  let label = 'LISTENING';

  if (state === 'ai_speaking') {
    primaryColor = activeColor || '#f43f5e';
    label = `${activeSpeakerName.toUpperCase()} SPEAKING`;
  } else if (state === 'user_speaking') {
    primaryColor = '#38bdf8';
    label = 'YOU ARE SPEAKING';
  } else if (state === 'processing') {
    primaryColor = '#a855f7';
    label = 'PROCESSING TURN';
  } else if (state === 'interrupted') {
    primaryColor = '#f59e0b';
    label = 'INTERRUPTED';
  }

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center select-none">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-30 transition-all duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
        }}
      />

      {/* SVG Canvas for state rings */}
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="arenaCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
            <stop offset="70%" stopColor="#0c0d12" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#050507" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Outer Ring */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        {/* State 1: AI SPEAKING - Pulse expands outward */}
        {state === 'ai_speaking' && (
          <>
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeOpacity="0.3"
              className="animate-ping-slow origin-center"
            />
            <circle
              cx="100"
              cy="100"
              r="62"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              strokeDasharray="4 6"
              strokeOpacity="0.6"
              className="animate-spin-slow origin-center"
            />
          </>
        )}

        {/* State 2: USER SPEAKING - Concentric energy rings */}
        {state === 'user_speaking' && (
          <>
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeOpacity="0.4"
              className="animate-ping-slow origin-center"
            />
            <circle
              cx="100"
              cy="100"
              r="68"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              className="animate-spin-reverse origin-center"
            />
          </>
        )}

        {/* State 3: LISTENING - Small circular waves */}
        {state === 'listening' && (
          <>
            <circle
              cx="100"
              cy="100"
              r="66"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
            <circle
              cx="100"
              cy="100"
              r="54"
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              strokeOpacity="0.35"
              className="animate-ping origin-center"
              style={{ animationDuration: '3s' }}
            />
          </>
        )}

        {/* State 4: PROCESSING - Rotating subtle ring */}
        {state === 'processing' && (
          <>
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="16 32"
              className="animate-spin origin-center"
              style={{ animationDuration: '4s' }}
            />
          </>
        )}

        {/* State 5: INTERRUPTED - Short warning pulse */}
        {state === 'interrupted' && (
          <>
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeOpacity="0.8"
              className="animate-ping origin-center"
              style={{ animationDuration: '0.8s' }}
            />
          </>
        )}

        {/* Central Core Disk */}
        <circle
          cx="100"
          cy="100"
          r="48"
          fill="url(#arenaCoreGrad)"
          stroke={primaryColor}
          strokeWidth="1.8"
          className="transition-colors duration-300"
        />

        {/* Inner Waveform / Audio Pulse Bars */}
        <g transform="translate(76, 88)">
          <rect
            x="4"
            y="6"
            width="4"
            height="12"
            rx="2"
            fill={primaryColor}
            className={state === 'ai_speaking' || state === 'user_speaking' ? 'animate-waveform' : ''}
            style={{ animationDelay: '0ms' }}
          />
          <rect
            x="14"
            y="2"
            width="4"
            height="20"
            rx="2"
            fill={primaryColor}
            className={state === 'ai_speaking' || state === 'user_speaking' ? 'animate-waveform' : ''}
            style={{ animationDelay: '150ms' }}
          />
          <rect
            x="24"
            y="8"
            width="4"
            height="10"
            rx="2"
            fill={primaryColor}
            className={state === 'ai_speaking' || state === 'user_speaking' ? 'animate-waveform' : ''}
            style={{ animationDelay: '300ms' }}
          />
          <rect
            x="34"
            y="4"
            width="4"
            height="16"
            rx="2"
            fill={primaryColor}
            className={state === 'ai_speaking' || state === 'user_speaking' ? 'animate-waveform' : ''}
            style={{ animationDelay: '100ms' }}
          />
        </g>
      </svg>

      {/* Floating State Badge Under Core */}
      <div
        className="absolute -bottom-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-md flex items-center gap-1.5 backdrop-blur-md z-10 transition-colors"
        style={{
          backgroundColor: `${primaryColor}15`,
          color: primaryColor,
          borderColor: `${primaryColor}40`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
        <span>{label}</span>
      </div>
    </div>
  );
}
