import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export function ParticipantCard({
  participant,
  status = 'idle', // 'idle' | 'speaking' | 'thinking' | 'interrupted'
  isSpeaking = false,
}) {
  const isInterrupted = status === 'interrupted';
  const color = participant.color || '#f43f5e';
  const isStudent = participant.id === 'you';

  return (
    <div
      className={`relative p-3.5 sm:p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between select-none ${
        isSpeaking
          ? 'bg-gradient-to-b from-[#181224] to-[#0c0d14] border-pink-500/80 shadow-[0_0_24px_rgba(244,63,94,0.22)] -translate-y-1'
          : isInterrupted
          ? 'bg-arena-surface/90 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          : 'bg-arena-surface/60 border-white/5 opacity-70 hover:opacity-90'
      }`}
      style={{
        borderColor: isSpeaking ? color : isInterrupted ? '#f59e0b' : undefined,
      }}
    >
      {/* Top Row: Avatar initials + Mic status + Speaking indicator */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar box (Not giant circular portrait) */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-heading font-extrabold text-xs transition-all ${
              isSpeaking
                ? 'shadow-md scale-105'
                : 'bg-black/40 border border-white/10 text-slate-300'
            }`}
            style={{
              backgroundColor: isSpeaking ? `${color}25` : undefined,
              borderColor: isSpeaking ? color : undefined,
              borderWidth: isSpeaking ? '1.5px' : '1px',
              color: isSpeaking ? '#ffffff' : undefined,
              boxShadow: isSpeaking ? `0 0 12px ${color}40` : undefined,
            }}
          >
            {participant.avatarLetter || participant.name?.[0] || 'P'}
          </div>

          <div>
            <h4 className="font-heading font-bold text-white text-xs sm:text-sm tracking-tight leading-tight">
              {participant.name}
            </h4>
            <span
              className="text-[10px] font-mono block leading-tight font-medium"
              style={{ color: isSpeaking ? color : 'rgb(148, 163, 184)' }}
            >
              {participant.role}
            </span>
          </div>
        </div>

        {/* Mic & Activity State */}
        <div className="flex items-center gap-1.5">
          {isSpeaking && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border animate-pulse"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                borderColor: `${color}50`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>SPEAKING</span>
            </div>
          )}

          {isInterrupted && (
            <div className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/50">
              INTERRUPTED
            </div>
          )}

          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isSpeaking ? 'text-pink-400 bg-pink-500/10' : 'text-slate-400 bg-black/20'
            }`}
          >
            {isSpeaking ? <Mic size={12} /> : <MicOff size={12} />}
          </div>
        </div>
      </div>

      {/* Audio Waveform Indicator when speaking */}
      <div className="h-4 flex items-center gap-1 mt-2">
        {isSpeaking ? (
          <>
            <div className="w-1 bg-current h-2 rounded-full animate-waveform" style={{ color, animationDelay: '0ms' }} />
            <div className="w-1 bg-current h-4 rounded-full animate-waveform" style={{ color, animationDelay: '150ms' }} />
            <div className="w-1 bg-current h-2.5 rounded-full animate-waveform" style={{ color, animationDelay: '300ms' }} />
            <div className="w-1 bg-current h-3.5 rounded-full animate-waveform" style={{ color, animationDelay: '100ms' }} />
            <div className="w-1 bg-current h-1.5 rounded-full animate-waveform" style={{ color, animationDelay: '200ms' }} />
            <span className="text-[10px] text-slate-400 ml-1 font-mono truncate">
              Broadcasting voice channel
            </span>
          </>
        ) : (
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="w-0 h-full bg-slate-600" />
          </div>
        )}
      </div>
    </div>
  );
}
