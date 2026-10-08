import React, { useState, useEffect } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { ParticipantCard } from './ParticipantCard';
import { CentralEnergyCore } from './CentralEnergyCore';
import { LiveTranscript } from './LiveTranscript';
import { PushToTalkDock } from './PushToTalkDock';
import { TurnIndicator } from './TurnIndicator';
import { ArenaStatusPanel } from './ArenaStatusPanel';
import { EndDiscussionModal } from './EndDiscussionModal';
import { Button } from '../common/Button';
import { Clock, Radio, StopCircle, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export function ArenaPage() {
  const {
    topic,
    timeRemaining,
    participants,
    activeSpeakerId,
    speakerStatus,
    isStudentSpeaking,
    endSession,
    interruptionCount,
  } = useDiscussion();

  const [endModalOpen, setEndModalOpen] = useState(false);
  const [interruptedEvent, setInterruptedEvent] = useState(null);

  // Format countdown mm:ss
  const mins = Math.floor(Math.max(0, timeRemaining) / 60);
  const secs = Math.max(0, timeRemaining) % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Find active speaker
  const activeParticipant = participants.find((p) => p.id === activeSpeakerId);

  // Derive Central Core state
  let coreState = 'listening';
  if (isStudentSpeaking) {
    coreState = 'user_speaking';
  } else if (activeSpeakerId && activeSpeakerId !== 'you') {
    const status = speakerStatus[activeSpeakerId];
    if (status === 'interrupted') {
      coreState = 'interrupted';
    } else {
      coreState = 'ai_speaking';
    }
  }

  // Watch for interruption state
  useEffect(() => {
    const interruptedEntry = Object.entries(speakerStatus).find(
      ([id, st]) => st === 'interrupted'
    );
    if (interruptedEntry) {
      const p = participants.find((part) => part.id === interruptedEntry[0]);
      setInterruptedEvent(p ? p.name : 'AI');
      const timer = setTimeout(() => setInterruptedEvent(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [speakerStatus, participants]);

  function handleConfirmEnd() {
    setEndModalOpen(false);
    endSession();
  }

  return (
    <div className="relative min-h-[calc(100vh-75px)] px-4 sm:px-6 py-4 max-w-7xl mx-auto flex flex-col justify-between gap-4">
      {/* 1. TOP BAR */}
      <header className="glass-panel px-4 sm:px-6 py-3 rounded-xl bg-arena-surface/90 border border-white/10 flex items-center justify-between gap-4">
        {/* Left: Brand + Topic */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-heading font-extrabold text-white text-base tracking-tight">
              GD ARENA
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block flex-shrink-0" />

          {/* Topic */}
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:block">
              ACTIVE TOPIC
            </span>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
              {topic}
            </h2>
          </div>
        </div>

        {/* Right: Timer & END GD Button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
            <Clock size={13} className="text-pink-400" />
            <span className="font-bold text-white tracking-widest">{timeFormatted}</span>
          </div>

          {/* End GD Action */}
          <Button
            variant="danger"
            size="compact"
            onClick={() => setEndModalOpen(true)}
            className="!h-9 !px-3.5 !text-xs"
          >
            END GD
          </Button>
        </div>
      </header>

      {/* 2. TURN INDICATOR STRIP */}
      <div className="w-full flex items-center justify-between gap-4">
        <TurnIndicator currentSpeakerId={activeSpeakerId || 'moderator'} />
      </div>

      {/* 3. MAIN ARENA GRID: Left 6 Participants + Center Core | Right Live Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
        {/* Left Column: 6 Participants Grid & Central Energy Core */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          {/* Central AI Energy Core + Floating Status Panel */}
          <div className="relative flex flex-col md:flex-row items-center justify-around p-4 sm:p-6 rounded-xl glass-panel bg-arena-surface/60 border border-white/10 min-h-[260px]">
            {/* Center Energy Core */}
            <div className="py-2">
              <CentralEnergyCore
                state={coreState}
                activeSpeakerName={activeParticipant?.name || 'Moderator'}
                activeColor={activeParticipant?.color || '#f43f5e'}
              />
            </div>

            {/* Floating Arena Status Panel */}
            <div className="w-full md:w-80 mt-4 md:mt-0">
              <ArenaStatusPanel
                topic={topic}
                timeFormatted={timeFormatted}
                currentSpeakerName={activeParticipant?.name || 'MODERATOR'}
                audioActive={true}
              />
            </div>
          </div>

          {/* Six Participant Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {participants.map((p) => {
              const isSpeaker = p.id === activeSpeakerId || (p.id === 'you' && isStudentSpeaking);
              return (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  status={speakerStatus[p.id] || (isSpeaker ? 'speaking' : 'idle')}
                  isSpeaking={isSpeaker}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Transcript */}
        <div className="lg:col-span-4 h-[450px] lg:h-auto min-h-[400px]">
          <LiveTranscript
            currentStatus={
              isStudentSpeaking
                ? 'Listening to Student'
                : activeParticipant
                ? `${activeParticipant.name} Speaking`
                : 'Listening'
            }
          />
        </div>
      </div>

      {/* 4. VOICE CONTROL DOCK */}
      <div className="pt-2">
        <PushToTalkDock onEndClick={() => setEndModalOpen(true)} />
      </div>

      {/* 5. END GD CONFIRMATION MODAL */}
      <EndDiscussionModal
        isOpen={endModalOpen}
        onCancel={() => setEndModalOpen(false)}
        onConfirm={handleConfirmEnd}
      />
    </div>
  );
}
