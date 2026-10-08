import React, { useState } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { Button } from '../common/Button';
import { ArrowRight, ArrowLeft, Check, Sparkles, Users, HelpCircle } from 'lucide-react';

export function SetupPage() {
  const { startSession, navigate, addToast } = useDiscussion();

  const presetTopics = [
    "Should AI replace human jobs?",
    "Is remote work the future?",
    "Social media: benefit or threat?"
  ];

  const [selectedTopic, setSelectedTopic] = useState(presetTopics[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [participantCount, setParticipantCount] = useState(4); // 3, 4, or 5

  // Personas matching specifications
  const personas = [
    {
      id: 'aarav',
      name: 'AARAV',
      role: 'Analyst',
      personality: 'Logical and evidence-focused',
      color: '#3B82F6',
      letter: 'A'
    },
    {
      id: 'meera',
      name: 'MEERA',
      role: 'Creative',
      personality: 'Innovative and big-picture',
      color: '#EC4899',
      letter: 'M'
    },
    {
      id: 'kabir',
      name: 'KABIR',
      role: 'Critic',
      personality: 'Skeptical and challenging',
      color: '#F97316',
      letter: 'K'
    },
    {
      id: 'ananya',
      name: 'ANANYA',
      role: 'Collaborator',
      personality: 'Balanced and supportive',
      color: '#10B981',
      letter: 'N'
    },
    {
      id: 'rohan',
      name: 'ROHAN',
      role: 'Debater',
      personality: 'Assertive and persuasive',
      color: '#EAB308',
      letter: 'R'
    },
    {
      id: 'moderator',
      name: 'MODERATOR',
      role: 'Facilitator',
      personality: 'Controls flow and timing',
      color: '#A855F7',
      letter: 'M',
      isFixed: true
    }
  ];

  // Selected persona state based on participantCount
  // Moderator is always included.
  const activeAiIds = personas
    .filter(p => !p.isFixed)
    .slice(0, participantCount)
    .map(p => p.id);

  function handleSelectPreset(topic) {
    setIsCustomMode(false);
    setSelectedTopic(topic);
  }

  function handleSelectCustom() {
    setIsCustomMode(true);
  }

  function handleEnterArena() {
    const finalTopic = isCustomMode ? customTopic.trim() : selectedTopic;
    if (!finalTopic) {
      addToast("Please select or enter a discussion topic", "warning");
      return;
    }

    startSession({
      selectedTopic: finalTopic,
      selectedAiCount: participantCount,
      selectedDuration: 5
    });
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] py-10 px-5 sm:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-pink-400 uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>SESSION CONFIGURATION</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Prepare Your Arena
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your discussion topic and AI cohorts before stepping into the live room.
          </p>
        </div>

        {/* 1. TOPIC SELECTION */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold font-heading uppercase tracking-wider text-slate-300">
              CHOOSE TOPIC
            </label>
            <span className="text-[11px] font-mono text-slate-400">Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presetTopics.map((topic) => {
              const isSelected = !isCustomMode && selectedTopic === topic;
              return (
                <div
                  key={topic}
                  onClick={() => handleSelectPreset(topic)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between min-h-[90px] ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1c1527] to-[#0e0f17] border-pink-500/60 shadow-[0_0_20px_rgba(244,63,94,0.18)] -translate-y-0.5'
                      : 'bg-arena-surface/80 border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
                    {topic}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-slate-400">Preset</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-white">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom Topic Card */}
            <div
              onClick={handleSelectCustom}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between min-h-[90px] ${
                isCustomMode
                  ? 'bg-gradient-to-b from-[#1c1527] to-[#0e0f17] border-pink-500/60 shadow-[0_0_20px_rgba(244,63,94,0.18)] -translate-y-0.5'
                  : 'bg-arena-surface/80 border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
                  Custom Topic
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Enter your own prompt</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-pink-400">Custom</span>
                {isCustomMode && (
                  <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-white">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Topic Input when selected */}
          {isCustomMode && (
            <div className="mt-3 p-3 rounded-xl bg-arena-surface/90 border border-pink-500/30 animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="Type your custom group discussion topic here (e.g., 'Universal Basic Income: Feasibility & Impact')..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/60"
              />
            </div>
          )}
        </section>

        {/* 2. PARTICIPANT SELECTION */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold font-heading uppercase tracking-wider text-slate-300">
              PARTICIPANT SELECTION
            </label>
            <span className="text-xs font-mono text-pink-400 font-semibold">
              {participantCount} AI Participants Active (+ 1 Moderator)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[3, 4, 5].map((count) => {
              const isSelected = participantCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setParticipantCount(count)}
                  className={`h-11 px-4 rounded-lg font-heading text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 border flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500/20 to-violet-500/20 border-pink-500/60 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-arena-surface/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Users size={14} className={isSelected ? 'text-pink-400' : 'text-slate-400'} />
                  <span>{count} AI Participants</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. PERSONA CARDS */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold font-heading uppercase tracking-wider text-slate-300">
              PERSONA CARDS
            </label>
            <span className="text-[11px] text-slate-400">
              Active personas dynamically adjusted by participant count
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {personas.map((persona) => {
              const isSelected = persona.isFixed || activeAiIds.includes(persona.id);
              return (
                <div
                  key={persona.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 relative flex flex-col justify-between min-h-[140px] ${
                    isSelected
                      ? 'bg-arena-surface/90 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] -translate-y-1'
                      : 'bg-arena-surface/30 border-white/5 opacity-40 grayscale'
                  }`}
                  style={{
                    borderColor: isSelected ? `${persona.color}60` : undefined,
                    boxShadow: isSelected ? `0 0 16px ${persona.color}25` : undefined,
                  }}
                >
                  <div>
                    {/* Top Row: Avatar & Check */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-heading font-extrabold text-xs"
                        style={{
                          backgroundColor: `${persona.color}20`,
                          color: persona.color,
                          border: `1px solid ${persona.color}50`,
                        }}
                      >
                        {persona.letter}
                      </div>

                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: persona.color }}
                        >
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <h4 className="font-heading font-bold text-white text-sm">
                      {persona.name}
                    </h4>
                    <span
                      className="text-[10px] font-mono font-medium block"
                      style={{ color: persona.color }}
                    >
                      {persona.role}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-tight mt-2">
                    {persona.personality}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 4. SETUP CTAs */}
      <footer className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          icon={ArrowLeft}
          iconPosition="left"
          onClick={() => navigate('landing')}
        >
          BACK
        </Button>

        <Button
          variant="primary"
          size="large"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleEnterArena}
          className="!px-8"
        >
          ENTER GD ROOM
        </Button>
      </footer>
    </div>
  );
}
