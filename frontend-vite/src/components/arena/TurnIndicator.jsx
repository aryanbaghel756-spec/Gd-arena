import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

export function TurnIndicator({ currentSpeakerId = 'moderator' }) {
  // Ordered sequence matching specifications
  const sequence = [
    { id: 'you', label: 'YOU' },
    { id: 'moderator', label: 'MODERATOR' },
    { id: 'aarav', label: 'AARAV' },
    { id: 'kabir', label: 'KABIR' },
    { id: 'meera', label: 'MEERA' },
    { id: 'rohan', label: 'ROHAN' },
    { id: 'ananya', label: 'ANANYA' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 px-2.5 rounded-lg bg-arena-surface/80 border border-white/5 text-[11px] font-mono select-none scrollbar-none">
      <span className="text-slate-400 font-bold uppercase mr-1 text-[9px] tracking-wider">
        TURN FLOW:
      </span>
      {sequence.map((node, index) => {
        const isCurrent = node.id === currentSpeakerId;
        return (
          <React.Fragment key={node.id}>
            <div
              className={`px-2 py-0.5 rounded transition-all duration-200 whitespace-nowrap font-semibold ${
                isCurrent
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {node.label}
            </div>
            {index < sequence.length - 1 && (
              <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
