import React from 'react';

/**
 * Custom SVG Vector: Stylized AI Discussion Arena with Central Voice Core,
 * Concentric Counter-Rotating Rings, Connected Persona Nodes, and Pulsing Data Particles
 */
export function HeroArenaVector({ className = "w-full h-auto max-w-lg" }) {
  return (
    <div className="relative flex items-center justify-center w-full select-none">
      <svg
        viewBox="0 0 540 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="AI Discussion Arena Visualization"
      >
        <defs>
          {/* Core Glow Gradients */}
          <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <radialGradient id="arenaAmbientSphere" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="nodeGlowCyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <filter id="arenaGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Radial Atmosphere Sphere */}
        <circle cx="270" cy="220" r="190" fill="url(#arenaAmbientSphere)" />

        {/* 1. Slow Counter-Rotating Outer Orbit Ring (Counter-Clockwise, ~30s) */}
        <g style={{ transformOrigin: '270px 220px' }} className="animate-orbit-ccw">
          <circle cx="270" cy="220" r="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 8" />
          {/* Small orbital markers on outer ring */}
          <circle cx="430" cy="220" r="3" fill="#22D3EE" opacity="0.8" />
          <circle cx="110" cy="220" r="3" fill="#8B5CF6" opacity="0.8" />
          <circle cx="270" cy="60" r="2.5" fill="#3B82F6" opacity="0.6" />
          <circle cx="270" cy="380" r="2.5" fill="#EC4899" opacity="0.6" />
        </g>

        {/* 2. Slow Clockwise Inner Orbit Ring (Clockwise, ~22s) */}
        <g style={{ transformOrigin: '270px 220px' }} className="animate-orbit-cw">
          <circle cx="270" cy="220" r="115" stroke="rgba(34,211,238,0.22)" strokeWidth="1.5" strokeDasharray="6 6" />
          {/* Orbiting nodes on inner ring */}
          <circle cx="385" cy="220" r="4" fill="#22D3EE" />
          <circle cx="155" cy="220" r="3.5" fill="#8B5CF6" />
        </g>

        {/* Static concentric guidelines */}
        <circle cx="270" cy="220" r="70" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="2 4" />

        {/* 3. Pulsing Communication Network Lines (Center to Personas) */}
        <g className="animate-pulse-line">
          {/* Center to Moderator (top) */}
          <line x1="270" y1="220" x2="270" y2="70" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.7" />
          {/* Center to Aarav (top-left) */}
          <line x1="270" y1="220" x2="140" y2="120" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
          {/* Center to Meera (top-right) */}
          <line x1="270" y1="220" x2="400" y2="120" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
          {/* Center to Kabir (mid-right) */}
          <line x1="270" y1="220" x2="445" y2="245" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
          {/* Center to Ananya (bottom-right) */}
          <line x1="270" y1="220" x2="370" y2="350" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
          {/* Center to Rohan (bottom-left) */}
          <line x1="270" y1="220" x2="170" y2="350" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
          {/* Center to YOU (mid-left) - Active Voice Channel */}
          <line x1="270" y1="220" x2="95" y2="245" stroke="#22D3EE" strokeWidth="2.5" strokeOpacity="0.9" />
        </g>

        {/* Floating Ambient Data Particles */}
        <g className="animate-float-p1">
          <circle cx="205" cy="165" r="2" fill="#22D3EE" opacity="0.7" />
          <circle cx="340" cy="175" r="2.5" fill="#8B5CF6" opacity="0.8" />
          <circle cx="395" cy="295" r="2" fill="#10B981" opacity="0.7" />
        </g>
        <g className="animate-float-p2">
          <circle cx="225" cy="285" r="2" fill="#F59E0B" opacity="0.6" />
          <circle cx="120" cy="180" r="2.5" fill="#3B82F6" opacity="0.7" />
          <circle cx="430" cy="180" r="2" fill="#EC4899" opacity="0.7" />
        </g>

        {/* 4. CENTRAL AI CORE (Microphone & Communication Intelligence Engine) */}
        <g filter="url(#arenaGlowFilter)">
          <circle cx="270" cy="220" r="44" fill="#0A0E1A" stroke="url(#coreGradient)" strokeWidth="3" />
          <circle cx="270" cy="220" r="30" fill="rgba(34,211,238,0.12)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="270" cy="220" r="15" fill="url(#coreGradient)" />
        </g>

        {/* Live Audio Waveform Bars inside Central Core */}
        <g transform="translate(254, 204)">
          <rect x="0" y="8" width="3.5" height="16" rx="1.75" fill="#22D3EE">
            <animate attributeName="height" values="8;20;8" dur="0.9s" repeatCount="indefinite" />
            <animate attributeName="y" values="12;6;12" dur="0.9s" repeatCount="indefinite" />
          </rect>
          <rect x="7" y="3" width="3.5" height="26" rx="1.75" fill="#22D3EE">
            <animate attributeName="height" values="14;28;14" dur="1.1s" repeatCount="indefinite" />
            <animate attributeName="y" values="9;2;9" dur="1.1s" repeatCount="indefinite" />
          </rect>
          <rect x="14" y="0" width="3.5" height="32" rx="1.75" fill="#FFFFFF">
            <animate attributeName="height" values="18;34;18" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" values="7;0;7" dur="0.8s" repeatCount="indefinite" />
          </rect>
          <rect x="21" y="4" width="3.5" height="24" rx="1.75" fill="#8B5CF6">
            <animate attributeName="height" values="12;26;12" dur="1.0s" repeatCount="indefinite" />
            <animate attributeName="y" values="10;3;10" dur="1.0s" repeatCount="indefinite" />
          </rect>
          <rect x="28" y="9" width="3.5" height="14" rx="1.75" fill="#8B5CF6">
            <animate attributeName="height" values="6;18;6" dur="0.85s" repeatCount="indefinite" />
            <animate attributeName="y" values="13;7;13" dur="0.85s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* 5. TOP MODERATOR NODE (Facilitator) */}
        <g transform="translate(270, 70)" className="cursor-pointer">
          <circle cx="0" cy="0" r="26" fill="rgba(139,92,246,0.18)" />
          <circle cx="0" cy="0" r="22" fill="#0E1626" stroke="#8B5CF6" strokeWidth="2.5" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Space Grotesk">M</text>
          <rect x="-34" y="-36" width="68" height="16" rx="8" fill="rgba(13, 18, 34, 0.9)" stroke="#8B5CF6" strokeWidth="1" />
          <text x="0" y="-25" textAnchor="middle" fill="#C4B5FD" fontSize="8" fontWeight="700" fontFamily="Space Grotesk">MODERATOR</text>
        </g>

        {/* 6. NODE: Aarav (Analyst - Blue) */}
        <g transform="translate(140, 120)">
          <circle cx="0" cy="0" r="22" fill="#0E1626" stroke="#3B82F6" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">A</text>
          <circle cx="16" cy="-14" r="5" fill="#3B82F6" />
          <text x="0" y="34" textAnchor="middle" fill="#93C5FD" fontSize="9" fontWeight="600" fontFamily="Space Grotesk">Aarav</text>
        </g>

        {/* 7. NODE: Meera (Creative - Pink) */}
        <g transform="translate(400, 120)">
          <circle cx="0" cy="0" r="22" fill="#0E1626" stroke="#EC4899" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">M</text>
          <circle cx="16" cy="-14" r="5" fill="#EC4899" />
          <text x="0" y="34" textAnchor="middle" fill="#F472B6" fontSize="9" fontWeight="600" fontFamily="Space Grotesk">Meera</text>
        </g>

        {/* 8. NODE: Kabir (Critic - Orange) */}
        <g transform="translate(445, 245)">
          <circle cx="0" cy="0" r="22" fill="#0E1626" stroke="#F97316" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">K</text>
          <circle cx="16" cy="-14" r="5" fill="#F97316" />
          <text x="0" y="34" textAnchor="middle" fill="#FB923C" fontSize="9" fontWeight="600" fontFamily="Space Grotesk">Kabir</text>
        </g>

        {/* 9. NODE: Ananya (Collaborator - Green) */}
        <g transform="translate(370, 350)">
          <circle cx="0" cy="0" r="22" fill="#0E1626" stroke="#10B981" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">N</text>
          <circle cx="16" cy="-14" r="5" fill="#10B981" />
          <text x="0" y="34" textAnchor="middle" fill="#34D399" fontSize="9" fontWeight="600" fontFamily="Space Grotesk">Ananya</text>
        </g>

        {/* 10. NODE: Rohan (Debater - Amber) */}
        <g transform="translate(170, 350)">
          <circle cx="0" cy="0" r="22" fill="#0E1626" stroke="#F59E0B" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">R</text>
          <circle cx="16" cy="-14" r="5" fill="#F59E0B" />
          <text x="0" y="34" textAnchor="middle" fill="#FBBF24" fontSize="9" fontWeight="600" fontFamily="Space Grotesk">Rohan</text>
        </g>

        {/* 11. NODE: YOU (Student - Cyan with glowing pulse & active mic glyph) */}
        <g transform="translate(95, 245)">
          <circle cx="0" cy="0" r="30" fill="url(#nodeGlowCyan)" />
          <circle cx="0" cy="0" r="25" fill="#0E1626" stroke="#22D3EE" strokeWidth="3" />
          <text x="0" y="5" textAnchor="middle" fill="#22D3EE" fontSize="12" fontWeight="800" fontFamily="Space Grotesk">YOU</text>
          {/* Active Voice Microphone Icon Badge */}
          <rect x="-18" y="-36" width="36" height="15" rx="7.5" fill="#22D3EE" />
          <text x="0" y="-26" textAnchor="middle" fill="#070A13" fontSize="8" fontWeight="800" fontFamily="Space Grotesk">VOICE</text>
        </g>
      </svg>
    </div>
  );
}
