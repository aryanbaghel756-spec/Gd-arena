'use client';

import React, { useRef, useEffect } from 'react';
import { TranscriptItem } from '@/types/arena';
import { Subtitles, MessageSquare, Clock, Sparkles } from 'lucide-react';

interface TranscriptPanelProps {
  transcripts: TranscriptItem[];
  showCaptions: boolean;
  onToggleCaptions: () => void;
  className?: string;
}

export function TranscriptPanel({
  transcripts,
  showCaptions,
  onToggleCaptions,
  className = '',
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom whenever a new transcript item arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div
      className={`
        flex flex-col rounded-2xl bg-[#0c070c]/90 border border-[#ff1e2d]/30
        backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden
        ${className}
      `}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-[#291724] flex items-center justify-between bg-[#140b13]/80">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#ffc400]" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
            Live Round Transcript
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-zinc-400 border border-[#2b1825]">
            {transcripts.length} exchanges
          </span>
        </div>

        {/* Captions Toggle */}
        <button
          onClick={onToggleCaptions}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all
            ${showCaptions
              ? 'bg-[#ffc400]/20 text-[#ffc400] border border-[#ffc400]/60 shadow-[0_0_10px_rgba(255,196,0,0.3)]'
              : 'bg-black/40 text-zinc-400 border border-zinc-800 hover:text-white'
            }
          `}
          aria-label="Toggle Live Captions"
        >
          <Subtitles className="w-3.5 h-3.5" />
          <span>Captions {showCaptions ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Transcript Scroll Area (aria-live="polite" for screen readers) */}
      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px] sm:max-h-[460px]"
      >
        {transcripts.map((item) => {
          const isUser = item.role === 'user';
          const isModerator = item.role === 'moderator';

          return (
            <div
              key={item.id}
              className={`
                p-3.5 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed
                ${item.highlight
                  ? 'bg-[#291122]/90 border-[#ffc400] shadow-[0_0_15px_rgba(255,196,0,0.2)]'
                  : isUser
                    ? 'bg-[#1e101b]/80 border-[#ffc400]/30 ml-4'
                    : isModerator
                      ? 'bg-[#150d17]/80 border-[#3d2436]'
                      : 'bg-[#110910]/70 border-[#261521] mr-4'
                }
              `}
            >
              {/* Speaker Metadata Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#23121f]">
                <div className="flex items-center gap-2">
                  <span className={`font-display font-bold text-xs ${isUser ? 'text-[#ffc400]' : 'text-white'}`}>
                    {item.speakerName}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-zinc-400 border border-[#2b1725]">
                    {item.personality}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{item.timestamp}</span>
                </div>
              </div>

              {/* Speech Text */}
              <p className="text-zinc-200">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-2.5 bg-[#0a060a] border-t border-[#231320] text-center text-[10px] font-mono text-zinc-400">
        All voice turns are automatically transcribed and audited.
      </div>
    </div>
  );
}
