'use client';

import React from 'react';
import { Bot, UserCheck, Clock, Shield, Info } from 'lucide-react';
import { Participant } from '@/types/arena';

interface PanelSelectorProps {
  panelSize: number; // 3, 4, 5
  onSelectPanelSize: (size: number) => void;
  discussionMinutes: number; // 5, 8, 10
  onSelectMinutes: (min: number) => void;
  allParticipants: Participant[];
}

export function PanelSelector({
  panelSize,
  onSelectPanelSize,
  discussionMinutes,
  onSelectMinutes,
  allParticipants,
}: PanelSelectorProps) {
  // Panel size choices: 3, 4, 5
  const sizeOptions = [3, 4, 5];
  // Duration choices: 5, 8, 10 min
  const durationOptions = [5, 8, 10];

  const moderator = allParticipants.find((p) => p.role === 'moderator');
  const activeAIs = allParticipants.filter((p) => p.role === 'ai').slice(0, panelSize);

  return (
    <div className="space-y-6">
      
      {/* Panel Size Hex Toggle Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase tracking-widest text-amber-300">
            3. AI Panel Size (Simulation Difficulty)
          </label>
          <span className="text-xs font-mono text-zinc-400">
            {panelSize} AI Personas + 1 Moderator + You
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {sizeOptions.map((count) => {
            const isSelected = panelSize === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onSelectPanelSize(count)}
                className={`
                  relative py-3.5 px-4 font-display font-bold uppercase transition-all duration-200 clip-hex-flat select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc400]
                  ${isSelected
                    ? 'bg-gradient-to-r from-[#b80010] to-[#ffc400] text-white shadow-[0_0_20px_rgba(255,30,45,0.6)]'
                    : 'bg-[#140c13] text-zinc-400 hover:text-white border border-[#2d1825] hover:border-[#ff1e2d]/50'
                  }
                `}
              >
                <div className="text-base sm:text-lg">{count} AI Personas</div>
                <div className="text-[10px] font-mono opacity-80 mt-0.5">
                  {count === 3 && 'Focused Pace'}
                  {count === 4 && 'Balanced (Standard)'}
                  {count === 5 && 'High Pressure Arena'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Moderator Always-On Badge */}
      <div className="p-3.5 rounded-xl bg-[#170e17] border border-[#ffc400]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#271524] border border-[#ffc400]/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#ffc400]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">
                Autonomous Moderator (Dr. Evelyn Vance)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffc400]/20 text-[#ffc400] font-bold border border-[#ffc400]/40">
                ALWAYS ON
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Guarantees round initiation, enforces time limits, and prompts closing statements.
            </p>
          </div>
        </div>
      </div>

      {/* Active AI Personas Preview List */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-amber-300 mb-2.5">
          Active AI Persona Lineup:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeAIs.map((ai) => (
            <div
              key={ai.id}
              className="p-2.5 rounded-lg bg-[#110a10] border border-[#2b1723] flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-[#1c0e1a] border border-[#ff1e2d]/40 flex items-center justify-center font-display font-bold text-xs text-amber-300">
                {ai.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-xs text-white truncate">
                    {ai.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black text-[#ffc400] border border-amber-900/50">
                    {ai.personality}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {ai.tagline}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Duration Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#ffc400]" />
            4. Discussion Length
          </label>
          <span className="text-xs font-mono text-[#ffc400] font-bold">
            {discussionMinutes} Minutes
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {durationOptions.map((mins) => {
            const isSelected = discussionMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => onSelectMinutes(mins)}
                className={`
                  py-3 px-4 rounded-xl border text-center transition-all duration-200 select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc400]
                  ${isSelected
                    ? 'bg-[#220e1d] border-[#ffc400] text-white shadow-[0_0_15px_rgba(255,196,0,0.35)]'
                    : 'bg-[#130b12] border-[#291623] text-zinc-400 hover:text-white hover:border-[#ff1e2d]/40'
                  }
                `}
              >
                <div className="font-display font-extrabold text-lg text-white">
                  {mins} min
                </div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {mins === 5 ? 'Blitz Drill' : mins === 8 ? 'B-School Standard' : 'Executive In-Depth'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
