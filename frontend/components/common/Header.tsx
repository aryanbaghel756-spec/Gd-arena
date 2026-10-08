'use client';

import React from 'react';
import { Bot, ShieldAlert, Sparkles, Volume2, Mic, Radio } from 'lucide-react';
import { HexButton } from '../ui/HexButton';

interface HeaderProps {
  currentScreen: 'hero' | 'setup' | 'arena' | 'report' | 'pipeline';
  onNavigate: (screen: 'hero' | 'setup' | 'arena' | 'report' | 'pipeline') => void;
  isLiveDiscussion?: boolean;
}

export function Header({ currentScreen, onNavigate, isLiveDiscussion = false }: HeaderProps) {
  const [aiEngineStatus, setAiEngineStatus] = React.useState<{ isLive: boolean; provider: string }>({
    isLive: false,
    provider: 'Demo Engine'
  });

  React.useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.status === 'healthy') {
          setAiEngineStatus({
            isLive: !data.mock_mode,
            provider: data.provider || (data.mock_mode ? 'Demo Engine' : 'Ollama LLM')
          });
        }
      })
      .catch(() => {
        setAiEngineStatus({ isLive: false, provider: 'Demo Engine' });
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#07070a]/80 border-b border-[#281b22]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('hero')}
          aria-label="GD Arena Home"
        >
          <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Hexagon icon shield */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffc400] to-[#ff1e2d] clip-hex-regular shadow-[0_0_15px_rgba(255,30,45,0.6)] group-hover:scale-105 transition-transform" />
            <div className="absolute inset-[2px] bg-[#0c080b] clip-hex-regular flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ffc400] group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-amber-200 to-[#ffc400] bg-clip-text text-transparent">
                GD ARENA
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#ff1e2d]/20 text-[#ff4d5a] border border-[#ff1e2d]/40">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono tracking-tight hidden sm:block">
              VOICE EVALUATION LAB
            </p>
          </div>
        </div>

        {/* REQUIRED TRANSPARENCY BADGE & ENGINE STATUS */}
        <div className="flex items-center gap-2">
          {/* Live AI vs Demo Mode Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
            aiEngineStatus.isLive
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${aiEngineStatus.isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{aiEngineStatus.isLive ? `Live AI (${aiEngineStatus.provider})` : 'Demo Mode (Offline Engine)'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b1016]/90 border border-[#ff1e2d]/50 shadow-[0_0_12px_rgba(255,30,45,0.2)]">
            <Bot className="w-3.5 h-3.5 text-[#ffc400] animate-pulse" />
            <span className="text-xs font-medium text-amber-100 flex items-center gap-1.5">
              <span className="hidden md:inline text-zinc-400 font-mono text-[11px]">Notice:</span>
              <span>All participants other than you are AI</span>
            </span>
          </div>
        </div>

        {/* Right Navigation / Status Dock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Breadcrumb / Mode indicator */}
          {isLiveDiscussion ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#ff1e2d]/15 border border-[#ff1e2d]/60 text-xs font-mono text-[#ff4d5a]">
              <Radio className="w-3.5 h-3.5 animate-ping text-[#ff1e2d]" />
              <span className="font-bold tracking-wider">LIVE ARENA</span>
            </div>
          ) : (
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('hero')}
                className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider transition-colors ${
                  currentScreen === 'hero' ? 'text-[#ffc400] bg-amber-500/10 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                HOME
              </button>
              <button
                onClick={() => onNavigate('setup')}
                className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider transition-colors ${
                  currentScreen === 'setup' ? 'text-[#ffc400] bg-amber-500/10 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                SETUP
              </button>
              <button
                onClick={() => onNavigate('arena')}
                className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider transition-colors ${
                  currentScreen === 'arena' ? 'text-[#ffc400] bg-amber-500/10 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ARENA
              </button>
              <button
                onClick={() => onNavigate('report')}
                className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider transition-colors ${
                  currentScreen === 'report' ? 'text-[#ffc400] bg-amber-500/10 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                REPORT
              </button>
              <button
                onClick={() => onNavigate('pipeline')}
                className={`px-3 py-1.5 text-xs font-mono rounded tracking-wider transition-colors ${
                  currentScreen === 'pipeline' ? 'text-[#ffc400] bg-amber-500/10 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                PIPELINE
              </button>
            </nav>
          )}

          {/* Quick CTA if on Hero */}
          {currentScreen === 'hero' && (
            <HexButton
              variant="primary"
              size="sm"
              onClick={() => onNavigate('setup')}
              className="text-xs"
            >
              Start GD
            </HexButton>
          )}
        </div>

      </div>
    </header>
  );
}
