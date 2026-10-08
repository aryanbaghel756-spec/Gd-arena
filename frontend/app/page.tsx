'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HexBackground } from '@/components/canvas/HexBackground';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { RoomSetup } from '@/components/setup/RoomSetup';
import { LiveArena } from '@/components/arena/LiveArena';
import { ReportView } from '@/components/report/ReportView';
import { PipelineArchitecture } from '@/components/pipeline/PipelineArchitecture';
import { useGDSimulator } from '@/hooks/useGDSimulator';

export default function Home() {
  const {
    screen,
    setScreen,
    selectedTopic,
    setSelectedTopic,
    topicFacts,
    panelSize,
    setPanelSize,
    discussionMinutes,
    setDiscussionMinutes,
    participants,
    activeSpeakerId,
    currentSpeechSnippet,
    remainingSeconds,
    phase,
    isPaused,
    isMicOn,
    isHoldingSpeak,
    userAudioLevel,
    micError,
    transcripts,
    report,
    shuffleTopic,
    enterRoom,
    handleHoldSpeakStart,
    handleHoldSpeakEnd,
    handleSubmitTypedSpeech,
    handleInterrupt,
    handleToggleMic,
    handleTogglePause,
    handleSkipToClosing,
    handleEndGD,
    handleRetryMic,
    isStudentSatisfied,
    handleToggleSatisfaction,
  } = useGDSimulator();

  // Navigate to pipeline & architecture view
  const scrollToHowItWorks = () => {
    setScreen('pipeline');
  };

  const isSpeakingCurrently = Boolean(activeSpeakerId || isHoldingSpeak || isMicOn);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07070a] text-slate-100 overflow-x-hidden selection:bg-[#ff1e2d] selection:text-white">
      
      {/* Dynamic 60 FPS Hexagonal Grid Honeycomb Canvas Background */}
      <HexBackground
        isSpeaking={isSpeakingCurrently}
      />

      {/* Main Top Header with Mandatory AI Transparency Badge */}
      <Header
        currentScreen={screen}
        onNavigate={(nextScreen) => setScreen(nextScreen)}
        isLiveDiscussion={screen === 'arena'}
      />

      {/* Dynamic Animated Screen Transitions */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. HERO & HOW IT WORKS LANDING PAGE */}
          {screen === 'hero' && (
            <motion.div
              key="hero-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <HeroSection
                onStartGD={() => setScreen('setup')}
                onHowItWorks={scrollToHowItWorks}
                previewParticipants={participants}
              />
              <HowItWorks
                onStartGD={() => setScreen('setup')}
              />
            </motion.div>
          )}

          {/* 2. ROOM SETUP CONFIGURATION SCREEN */}
          {screen === 'setup' && (
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <RoomSetup
                selectedTopic={selectedTopic}
                onSelectTopic={setSelectedTopic}
                onShuffleTopic={shuffleTopic}
                panelSize={panelSize}
                onSelectPanelSize={setPanelSize}
                discussionMinutes={discussionMinutes}
                onSelectMinutes={setDiscussionMinutes}
                allParticipants={participants}
                onEnterRoom={enterRoom}
                onBack={() => setScreen('hero')}
              />
            </motion.div>
          )}

          {/* 3. LIVE GD ARENA ROUND TABLE & CONTROLS */}
          {screen === 'arena' && (
            <motion.div
              key="arena-screen"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <LiveArena
                topic={selectedTopic}
                participants={participants}
                transcripts={transcripts}
                topicFacts={topicFacts}
                isStudentSatisfied={isStudentSatisfied}
                onToggleSatisfaction={handleToggleSatisfaction}
                activeSpeakerId={activeSpeakerId}
                phase={phase}
                remainingSeconds={remainingSeconds}
                isPaused={isPaused}
                isMicOn={isMicOn}
                isHoldingSpeak={isHoldingSpeak}
                userAudioLevel={userAudioLevel}
                currentSpeechSnippet={currentSpeechSnippet}
                micError={micError}
                onHoldSpeakStart={handleHoldSpeakStart}
                onHoldSpeakEnd={handleHoldSpeakEnd}
                onToggleMic={handleToggleMic}
                onInterrupt={handleInterrupt}
                onTogglePause={handleTogglePause}
                onSkipToClosing={handleSkipToClosing}
                onEndGD={handleEndGD}
                onRetryMic={handleRetryMic}
                onSubmitTypedSpeech={handleSubmitTypedSpeech}
                onBackToSetup={() => setScreen('setup')}
              />
            </motion.div>
          )}

          {/* 4. PERFORMANCE EVALUATION & AUDIT REPORT VIEW */}
          {screen === 'report' && (
            <motion.div
              key="report-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <ReportView
                report={report}
                transcripts={transcripts}
                topicTitle={selectedTopic.title}
                onPractiseAgain={() => setScreen('setup')}
              />
            </motion.div>
          )}

          {/* 5. HOW IT WORKS / PIPELINE & ARCHITECTURE VIEW */}
          {screen === 'pipeline' && (
            <motion.div
              key="pipeline-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <PipelineArchitecture
                onBack={() => setScreen('hero')}
                onStartGD={() => setScreen('setup')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Common Footer with Hotkeys and Full Disclosures */}
      <Footer />

    </div>
  );
}
