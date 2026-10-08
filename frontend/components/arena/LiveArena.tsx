'use client';

import React, { useState } from 'react';
import { Topic, Participant, TranscriptItem, DiscussionPhase } from '@/types/arena';
import { RoomTable } from './RoomTable';
import { TranscriptPanel } from './TranscriptPanel';
import { ControlDock } from './ControlDock';
import { Clock, ShieldAlert, Sparkles, MessageSquare, Volume2, ArrowLeft } from 'lucide-react';
import { RectButton } from '../ui/RectButton';

interface LiveArenaProps {
  topic: Topic;
  participants: Participant[];
  transcripts: TranscriptItem[];
  activeSpeakerId: string | null;
  phase: DiscussionPhase;
  remainingSeconds: number;
  isPaused: boolean;
  isMicOn: boolean;
  isHoldingSpeak: boolean;
  userAudioLevel: number;
  currentSpeechSnippet?: string;
  micError: string | null;
  onHoldSpeakStart: () => void;
  onHoldSpeakEnd: () => void;
  onToggleMic: () => void;
  onInterrupt: () => void;
  onTogglePause: () => void;
  onSkipToClosing: () => void;
  onEndGD: () => void;
  onRetryMic: () => void;
  onSubmitTypedSpeech: (text: string) => void;
  onBackToSetup: () => void;
}

export function LiveArena({
  topic,
  participants,
  transcripts,
  activeSpeakerId,
  phase,
  remainingSeconds,
  isPaused,
  isMicOn,
  isHoldingSpeak,
  userAudioLevel,
  currentSpeechSnippet,
  micError,
  onHoldSpeakStart,
  onHoldSpeakEnd,
  onToggleMic,
  onInterrupt,
  onTogglePause,
  onSkipToClosing,
  onEndGD,
  onRetryMic,
  onSubmitTypedSpeech,
  onBackToSetup,
}: LiveArenaProps) {
  const [showCaptions, setShowCaptions] = useState(true);
  const [showMobileTranscript, setShowMobileTranscript] = useState(false);

  // Format seconds to MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = remainingSeconds <= 60;

  // Phase badges configuration
  const phaseConfig: Record<DiscussionPhase, { label: string; color: string; desc: string }> = {
    opening: {
      label: 'Phase 1: Opening Framing',
      color: 'bg-amber-500/20 text-[#ffc400] border-amber-500/40',
      desc: 'Define scope & primary thesis'
    },
    discussion: {
      label: 'Phase 2: Free Debate & Cross-Examination',
      color: 'bg-[#ff1e2d]/20 text-[#ff4d5a] border-[#ff1e2d]/50',
      desc: 'Defend ideas, counter-argue & synthesize'
    },
    closing: {
      label: 'Phase 3: Final Synthesis & Consensus',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      desc: 'Summarize takeaways and collective outcome'
    }
  };

  const currentPhaseInfo = phaseConfig[phase];

  return (
    <div className="relative z-10 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* TOP BAR: Topic, Glowing Countdown Timer, Phase Pill */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c070c]/90 border border-[#ff1e2d]/30 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Topic Title & Category */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBackToSetup}
            className="p-2 rounded-lg bg-[#180d16] hover:bg-[#261523] border border-[#2e1826] text-zinc-400 hover:text-white transition-colors"
            title="Return to Setup"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#200f1c] text-[#ffc400] border border-[#ff1e2d]/40 font-bold">
                {topic.category}
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline font-mono">
                Round in Session
              </span>
            </div>
            <h2 className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide truncate max-w-md mt-0.5">
              {topic.title}
            </h2>
          </div>
        </div>

        {/* Center: BIG GLOWING COUNTDOWN TIMER */}
        <div className="flex items-center gap-3">
          <div
            className={`
              relative px-6 py-2 rounded-xl border flex items-center gap-3 transition-all duration-300
              ${isTimeCritical 
                ? 'bg-[#3b0810]/95 border-[#ff1e2d] shadow-[0_0_25px_rgba(255,30,45,0.8)] animate-pulse' 
                : 'bg-[#140b13]/90 border-[#ffc400]/40 shadow-[0_0_20px_rgba(255,196,0,0.3)]'
              }
            `}
          >
            <Clock className={`w-5 h-5 ${isTimeCritical ? 'text-[#ff1e2d]' : 'text-[#ffc400]'}`} />
            <div className="text-center">
              <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                Time Remaining
              </div>
              <div
                className={`font-mono font-black text-2xl sm:text-3xl tracking-wider ${
                  isTimeCritical ? 'text-white' : 'text-amber-100'
                }`}
              >
                {timeString}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Phase Pill & Mobile Transcript Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 ${currentPhaseInfo.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{currentPhaseInfo.label}</span>
          </div>

          <button
            onClick={() => setShowMobileTranscript(!showMobileTranscript)}
            className="md:hidden p-2 rounded-lg bg-[#180d16] border border-[#ff1e2d]/40 text-[#ffc400]"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ARENA CONTENT AREA: Round Table + Transcript Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 or 8 columns: Round Table Center Stage */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full rounded-2xl bg-[#090509]/85 border border-[#281524] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
            <RoomTable
              participants={participants}
              activeSpeakerId={activeSpeakerId}
              isUserSpeaking={isHoldingSpeak || isMicOn}
              userAudioLevel={userAudioLevel}
              currentSpeechSnippet={showCaptions ? currentSpeechSnippet : undefined}
            />
          </div>

          {/* DOCKED CONTROL DOCK UNDER THE TABLE */}
          <div className="w-full mt-6">
            <ControlDock
              isHoldingSpeak={isHoldingSpeak}
              onHoldSpeakStart={onHoldSpeakStart}
              onHoldSpeakEnd={onHoldSpeakEnd}
              isMicOn={isMicOn}
              onToggleMic={onToggleMic}
              onInterrupt={onInterrupt}
              showCaptions={showCaptions}
              onToggleCaptions={() => setShowCaptions(!showCaptions)}
              isPaused={isPaused}
              onTogglePause={onTogglePause}
              onSkipToClosing={onSkipToClosing}
              onEndGD={onEndGD}
              micError={micError}
              onRetryMic={onRetryMic}
              onSubmitTypedSpeech={onSubmitTypedSpeech}
            />
          </div>
        </div>

        {/* Right 4 columns: Live Transcript Panel (Desktop & Drawer on Mobile) */}
        <div className={`lg:col-span-4 ${showMobileTranscript ? 'block' : 'hidden lg:block'}`}>
          <TranscriptPanel
            transcripts={transcripts}
            showCaptions={showCaptions}
            onToggleCaptions={() => setShowCaptions(!showCaptions)}
            className="h-full"
          />
        </div>

      </div>

    </div>
  );
}
