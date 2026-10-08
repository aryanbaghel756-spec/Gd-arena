import React from 'react';
import { Activity, Radio, Volume2, ShieldCheck, Clock } from 'lucide-react';

export function ArenaStatusPanel({
  topic = 'Should AI replace human jobs?',
  timeFormatted = '04:32',
  currentSpeakerName = 'KABIR',
  audioActive = true,
}) {
  return (
    <div className="glass-panel p-3.5 sm:p-4 rounded-xl bg-arena-surface/85 border border-white/10 shadow-xl backdrop-blur-md text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-pink-400" />
          <span className="font-heading font-bold text-white text-[11px] tracking-wider uppercase">
            ARENA STATUS
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
        {/* Session */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">SESSION</span>
          <span className="font-semibold text-white">LIVE #GD-2048</span>
        </div>

        {/* Time */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">TIME</span>
          <span className="font-mono font-bold text-pink-400">{timeFormatted}</span>
        </div>

        {/* Current Speaker */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">SPEAKER</span>
          <span className="font-semibold text-violet-300 truncate block">
            {currentSpeakerName.toUpperCase()}
          </span>
        </div>

        {/* Topic */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5 col-span-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">TOPIC</span>
          <span className="font-medium text-slate-200 truncate block">{topic}</span>
        </div>

        {/* Mode & Audio */}
        <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">MODE</span>
            <span className="font-semibold text-slate-300">DISCUSSION</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">AUDIO</span>
            <span className="font-mono font-bold text-emerald-400">
              {audioActive ? 'ON' : 'MUTED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
