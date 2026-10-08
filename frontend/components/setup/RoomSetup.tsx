'use client';

import React from 'react';
import { Topic, Participant } from '@/types/arena';
import { TopicPicker } from './TopicPicker';
import { PanelSelector } from './PanelSelector';
import { HexButton } from '../ui/HexButton';
import { RectButton } from '../ui/RectButton';
import { ArrowLeft, Play, Shuffle, Sparkles, Layers } from 'lucide-react';

interface RoomSetupProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
  onShuffleTopic: () => void;
  panelSize: number;
  onSelectPanelSize: (size: number) => void;
  discussionMinutes: number;
  onSelectMinutes: (min: number) => void;
  allParticipants: Participant[];
  onEnterRoom: () => void;
  onBack: () => void;
}

export function RoomSetup({
  selectedTopic,
  onSelectTopic,
  onShuffleTopic,
  panelSize,
  onSelectPanelSize,
  discussionMinutes,
  onSelectMinutes,
  allParticipants,
  onEnterRoom,
  onBack,
}: RoomSetupProps) {
  return (
    <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Back Button & Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase text-zinc-400 hover:text-[#ffc400] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
          <Layers className="w-4 h-4 text-[#ff1e2d]" />
          <span>CALIBRATE ARENA PARAMETERS</span>
        </div>
      </div>

      {/* Main Glass Card Container with Hexagon Corner Accents */}
      <div className="relative rounded-2xl bg-[#0f0a10]/90 border border-[#ff1e2d]/30 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
        
        {/* Hexagonal Corner Accents */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#ff1e2d] clip-hex-regular opacity-75 shadow-[0_0_12px_#ff1e2d]" />
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#ffc400] clip-hex-regular opacity-75 shadow-[0_0_12px_#ffc400]" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#ffc400] clip-hex-regular opacity-75 shadow-[0_0_12px_#ffc400]" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#ff1e2d] clip-hex-regular opacity-75 shadow-[0_0_12px_#ff1e2d]" />

        {/* Title */}
        <div className="mb-8 pb-6 border-b border-[#281723]">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white uppercase tracking-tight">
            Arena <span className="bg-gradient-to-r from-[#ff1e2d] to-[#ffc400] bg-clip-text text-transparent">Setup</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Configure your discussion topic, calibrate AI persona diversity, and set the round clock.
          </p>
        </div>

        {/* Form Body: Grid of Topic Picker & Panel Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Topic Selector */}
          <div>
            <TopicPicker
              selectedTopic={selectedTopic}
              onSelectTopic={onSelectTopic}
              onShuffleTopic={onShuffleTopic}
            />
          </div>

          {/* Right: Panel Size & Duration */}
          <div>
            <PanelSelector
              panelSize={panelSize}
              onSelectPanelSize={onSelectPanelSize}
              discussionMinutes={discussionMinutes}
              onSelectMinutes={onSelectMinutes}
              allParticipants={allParticipants}
            />
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="mt-10 pt-8 border-t border-[#2a1725] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <RectButton
              variant="secondary"
              size="md"
              onClick={onBack}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Back
            </RectButton>

            <RectButton
              variant="ghost"
              size="md"
              onClick={onShuffleTopic}
              icon={<Shuffle className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Shuffle Topic
            </RectButton>
          </div>

          <HexButton
            variant="primary"
            size="lg"
            onClick={onEnterRoom}
            icon={<Play className="w-5 h-5 fill-white" />}
            className="w-full sm:w-auto px-10 text-base shadow-[0_0_25px_rgba(255,30,45,0.7)]"
          >
            Enter Room
          </HexButton>
        </div>

      </div>

    </div>
  );
}
