import React, { useEffect, useRef } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { ScrollText, Zap, Radio, CheckCircle2 } from 'lucide-react';

export function LiveTranscript({ currentStatus = 'AI Speaking' }) {
  const { transcript, activeSpeakerId, isStudentSpeaking } = useDiscussion();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Derive status badge
  let statusText = currentStatus;
  let statusColor = 'text-pink-400 bg-pink-500/10 border-pink-500/30';
  if (isStudentSpeaking) {
    statusText = 'Listening to Student';
    statusColor = 'text-sky-400 bg-sky-500/10 border-sky-400/30';
  } else if (!activeSpeakerId) {
    statusText = 'Waiting for Turn';
    statusColor = 'text-slate-400 bg-slate-800 border-slate-700';
  }

  return (
    <div className="glass-panel flex flex-col h-full rounded-xl bg-arena-surface/85 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={15} className="text-pink-400" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
            LIVE TRANSCRIPT
          </h3>
        </div>

        {/* Live Status Badge */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{statusText}</span>
        </div>
      </div>

      {/* Transcript List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
            <Radio size={20} className="mb-2 text-pink-400/40 animate-pulse" />
            <p className="font-medium text-slate-300">Live discussion initializing...</p>
            <p className="text-[11px] text-slate-400 mt-1">Transcripts and turn handoffs appear in real time.</p>
          </div>
        ) : (
          transcript.map((entry, index) => {
            const isStudent = entry.speakerId === 'you' || entry.speaker === 'You';
            const isInterruption = entry.isInterruption || entry.type === 'interruption';
            const color = entry.color || (isStudent ? '#38bdf8' : '#ec4899');

            // Interruption Event Badge in Timeline
            if (isInterruption) {
              return (
                <div
                  key={entry.id || index}
                  className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-in fade-in"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-amber-400" />
                    <span className="font-mono text-[10px] text-amber-400/80">{entry.timestamp || '00:45'}</span>
                    <span className="font-semibold">{entry.text || `YOU INTERRUPTED ${entry.interruptedSpeaker || 'KABIR'}`}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200">
                    INTERRUPT
                  </span>
                </div>
              );
            }

            // Normal Spoken Entry
            return (
              <div
                key={entry.id || index}
                className={`p-3 rounded-xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
                  isStudent
                    ? 'bg-gradient-to-r from-sky-950/40 to-blue-950/20 border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.08)] ml-4'
                    : 'bg-black/30 border-white/5 mr-4'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {entry.timestamp || '00:12'}
                    </span>
                    <span
                      className="font-heading font-bold text-xs uppercase tracking-wide"
                      style={{ color }}
                    >
                      {entry.speaker}
                    </span>
                    {isStudent && (
                      <span className="text-[9px] font-mono px-1 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">
                        STUDENT
                      </span>
                    )}
                  </div>
                </div>

                {/* Spoken Text */}
                <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans">
                  "{entry.text}"
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
