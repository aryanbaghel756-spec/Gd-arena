import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Quote } from 'lucide-react';

export function ActionableFeedback({ onTimestampClick }) {
  const feedbackItems = [
    {
      id: 'fb-1',
      type: 'positive',
      title: 'STRONG POINT',
      timestamp: '01:42',
      summary: 'At 01:42 you built effectively on Aarav’s argument.',
      excerpt: '“Building on Aarav\'s point regarding structural job migration, the critical requirement is paired institutional training so workers transition into new roles rather than facing displacement.”',
      speakerRef: 'Aarav (Analyst)',
    },
    {
      id: 'fb-2',
      type: 'improvement',
      title: 'IMPROVEMENT',
      timestamp: '03:14',
      summary: 'At 03:14 you interrupted Kabir.',
      excerpt: '“Wait, but that ignores the transition timeline completely!” (Interrupted before Kabir finished establishing the regulatory timeline precedent).',
      speakerRef: 'Kabir (Critic)',
    },
  ];

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
          ACTIONABLE FEEDBACK
        </h3>
        <span className="text-xs text-slate-400">Click timestamps to jump to transcript</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedbackItems.map((item) => {
          const isPositive = item.type === 'positive';
          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isPositive
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <div>
                {/* Header Badge & Clickable Timestamp */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                        <CheckCircle2 size={12} />
                        <span>✓ {item.title}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                        <AlertTriangle size={12} />
                        <span>⚠ {item.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Clickable Timestamp */}
                  <button
                    type="button"
                    onClick={() => onTimestampClick?.(item.timestamp)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    title="Jump to transcript excerpt"
                  >
                    <span>{item.timestamp}</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Primary Feedback Summary */}
                <p className="font-medium text-slate-100 text-sm mb-3">
                  {item.summary}
                </p>

                {/* Transcript Excerpt */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300 italic flex items-start gap-2">
                  <Quote size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-sans">{item.excerpt}</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
                Persona referenced: <span className="text-slate-200">{item.speakerRef}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
