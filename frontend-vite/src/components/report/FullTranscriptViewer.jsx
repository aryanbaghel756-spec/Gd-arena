import React, { useState } from 'react';
import { Search, Filter, Clock, ChevronDown, ChevronUp, Zap, FileText } from 'lucide-react';

export function FullTranscriptViewer({ transcript = [], highlightedTimestamp = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('ALL');

  // Distinct speakers
  const speakers = ['ALL', ...new Set(transcript.map((t) => t.speaker || 'You'))];

  // Filtered transcript entries
  const filtered = transcript.filter((item) => {
    const matchesSpeaker = speakerFilter === 'ALL' || (item.speaker || 'You') === speakerFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      item.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpeaker && matchesQuery;
  });

  return (
    <div className="glass-panel rounded-xl bg-arena-surface/80 border border-white/10 overflow-hidden select-none">
      {/* Header / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              VIEW FULL TRANSCRIPT
            </h3>
            <p className="text-xs text-slate-400">
              {transcript.length} turns recorded with feedback timestamps and speaker tags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-white/5 space-y-4 animate-in fade-in duration-200">
          {/* Controls: Search, Filter Speaker, Jump info */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search transcript arguments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50"
              />
            </div>

            {/* Filter Speaker */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={speakerFilter}
                onChange={(e) => setSpeakerFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50 cursor-pointer"
              >
                {speakers.map((spk) => (
                  <option key={spk} value={spk} className="bg-arena-surface text-white">
                    {spk === 'ALL' ? 'All Speakers' : spk}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transcript Feed */}
          <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching transcript lines found.
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isStudent = item.speakerId === 'you' || item.speaker === 'You';
                const isInterruption = item.isInterruption || item.type === 'interruption';
                const isHighlighted =
                  highlightedTimestamp && item.timestamp?.includes(highlightedTimestamp);

                if (isInterruption) {
                  return (
                    <div
                      key={item.id || idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        isHighlighted
                          ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        <span className="font-mono text-[10px]">{item.timestamp || '00:45'}</span>
                        <span className="font-semibold">
                          {item.text || `YOU INTERRUPTED ${item.interruptedSpeaker || 'KABIR'}`}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20">
                        FEEDBACK POINT
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      isHighlighted
                        ? 'bg-pink-950/30 border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-pink-400'
                        : isStudent
                        ? 'bg-sky-950/20 border-sky-400/20 ml-3'
                        : 'bg-black/30 border-white/5 mr-3'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.timestamp || '00:12'}
                        </span>
                        <span
                          className="font-heading font-bold"
                          style={{ color: item.color || (isStudent ? '#38bdf8' : '#ec4899') }}
                        >
                          {item.speaker}
                        </span>
                        {isHighlighted && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/40">
                            EVALUATED
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">{item.text}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
