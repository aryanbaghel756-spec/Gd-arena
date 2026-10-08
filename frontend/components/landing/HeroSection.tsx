'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Play, ShieldAlert, Award, Mic, Users, BrainCircuit } from 'lucide-react';
import { HexButton } from '../ui/HexButton';
import { RectButton } from '../ui/RectButton';
import { Participant } from '@/types/arena';

interface HeroSectionProps {
  onStartGD: () => void;
  onHowItWorks: () => void;
  previewParticipants: Participant[];
}

export function HeroSection({ onStartGD, onHowItWorks, previewParticipants }: HeroSectionProps) {
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);

  // Cycle the speaking persona preview every 3 seconds to demonstrate real-time dynamics
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeakerIndex((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const previewPersonas = previewParticipants.slice(1, 5); // 4 AI participants (Analyst, Critic, Creative, Quiet/Dominator)

  const sampleQuotes = [
    '"Quantitatively, compute sovereignty requires at least a 3-year capital runway before achieving parity."',
    '"I must challenge that hypothesis—what happens when proprietary weights leapfrog public clusters?"',
    '"Look at open utility parallels: treating compute corridors like municipal power distribution."',
    '"If you wait for risk parity, you forfeit the global strategic leverage window entirely!"',
  ];

  return (
    <section className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Headline & Action Buttons */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          
          {/* Transparency Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1b0f16]/90 border border-[#ff1e2d]/60 shadow-[0_0_20px_rgba(255,30,45,0.25)]">
            <Bot className="w-4 h-4 text-[#ffc400] animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-amber-200">
              Notice: <span className="text-white">All participants other than you are AI</span>
            </span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-white uppercase leading-[0.95]">
              <span className="block drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">GD</span>
              <span className="bg-gradient-to-r from-[#ff1e2d] via-[#ffc400] to-[#ffe066] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,30,45,0.6)]">
                ARENA
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-amber-100/90 font-display font-medium tracking-wide max-w-xl mx-auto lg:mx-0">
              Practise group discussions with AI. <br className="hidden sm:inline" />
              <span className="text-[#ffc400] font-semibold">Get honest feedback.</span>
            </p>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Enter an intense, realistic roundtable with challenging AI personas—from aggressive dominators to analytical synthesizers. Speak freely via voice, handle sharp interruptions, and receive an instant line-by-line rubric audit.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 pt-2 text-left">
            <div className="p-3 rounded-lg bg-[#140c13]/80 border border-[#ff1e2d]/25 backdrop-blur-sm">
              <Mic className="w-4 h-4 text-[#ffc400] mb-1.5" />
              <div className="text-xs font-bold text-white uppercase font-display">Voice-First</div>
              <div className="text-[11px] text-zinc-400">Push-to-talk & interruption handling</div>
            </div>
            <div className="p-3 rounded-lg bg-[#140c13]/80 border border-[#ff1e2d]/25 backdrop-blur-sm">
              <Users className="w-4 h-4 text-[#ff1e2d] mb-1.5" />
              <div className="text-xs font-bold text-white uppercase font-display">4+ AI Personas</div>
              <div className="text-[11px] text-zinc-400">Analyst, Critic, Creative, Dominator</div>
            </div>
            <div className="p-3 rounded-lg bg-[#140c13]/80 border border-[#ff1e2d]/25 backdrop-blur-sm">
              <Award className="w-4 h-4 text-[#ffe066] mb-1.5" />
              <div className="text-xs font-bold text-white uppercase font-display">Instant Report</div>
              <div className="text-[11px] text-zinc-400">6 skill scores with transcript quotes</div>
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <HexButton
              variant="primary"
              size="lg"
              onClick={onStartGD}
              icon={<Play className="w-4 h-4 fill-white" />}
              className="w-full sm:w-auto text-base shadow-[0_0_28px_rgba(255,30,45,0.6)] hover:shadow-[0_0_40px_rgba(255,196,0,0.8)]"
            >
              Start a GD
            </HexButton>

            <RectButton
              variant="secondary"
              size="lg"
              onClick={onHowItWorks}
              icon={<Sparkles className="w-4 h-4 text-[#ffc400]" />}
              className="w-full sm:w-auto"
            >
              How it works
            </RectButton>
          </div>

        </div>

        {/* Right Column: Animated Hexagon-Shaped Panel Preview of 4 AI Participants */}
        <div className="lg:col-span-5 relative">
          
          {/* Subtle Ambient Glow Behind Panel */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#ff1e2d]/20 via-[#ffc400]/25 to-transparent blur-3xl rounded-3xl pointer-events-none" />

          {/* Glass Card Container */}
          <div className="relative rounded-2xl bg-[#0e090f]/90 border border-[#ff1e2d]/30 p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#281822]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff1e2d] animate-ping" />
                <span className="font-display font-bold text-sm tracking-widest text-amber-100 uppercase">
                  Simulated Round Table Preview
                </span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#20101a] text-zinc-400 border border-[#ff1e2d]/30">
                4 AI Personas
              </span>
            </div>

            {/* 4 Hexagonal AI Participants Grid */}
            <div className="grid grid-cols-2 gap-4">
              {previewPersonas.map((persona, idx) => {
                const isCurrentlySpeaking = activeSpeakerIndex === idx;

                return (
                  <div
                    key={persona.id}
                    className={`
                      relative p-4 rounded-xl border transition-all duration-300
                      ${isCurrentlySpeaking 
                        ? 'bg-[#220f18]/95 border-[#ffc400] shadow-[0_0_25px_rgba(255,196,0,0.4)] scale-[1.03]' 
                        : 'bg-[#120a11]/70 border-[#ff1e2d]/20 hover:border-[#ff1e2d]/50'
                      }
                    `}
                  >
                    {/* Top row: Avatar in Hexagon Clip + Tag */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Hexagon Border */}
                        <div
                          className={`
                            absolute inset-0 clip-hex-regular transition-all duration-300
                            ${isCurrentlySpeaking
                              ? 'bg-gradient-to-br from-[#ffc400] via-[#ff1e2d] to-[#ffe066] animate-pulse'
                              : 'bg-[#2a1b24]'
                            }
                          `}
                        />
                        {/* Inner Hexagon Avatar */}
                        <div className="absolute inset-[2px] bg-[#0c080c] clip-hex-regular flex items-center justify-center overflow-hidden">
                          <span className="font-display font-black text-sm text-amber-200">
                            {persona.name.split(' ')[0][0]}
                          </span>
                        </div>
                      </div>

                      {/* Personality Tag */}
                      <span
                        className={`
                          text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border
                          ${isCurrentlySpeaking
                            ? 'bg-[#ffc400]/20 text-[#ffc400] border-[#ffc400]/60'
                            : 'bg-black/50 text-zinc-400 border-zinc-700/50'
                          }
                        `}
                      >
                        {persona.personality}
                      </span>
                    </div>

                    {/* Name & Tagline */}
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">
                        {persona.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {persona.tagline}
                      </p>
                    </div>

                    {/* Voice Waveform Activity if Speaking */}
                    <div className="mt-3 pt-2 border-t border-[#261520] flex items-center justify-between">
                      {isCurrentlySpeaking ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="w-1 h-3 bg-[#ffc400] rounded animate-voice-wave" />
                            <span className="w-1 h-5 bg-[#ff1e2d] rounded animate-voice-wave [animation-delay:0.15s]" />
                            <span className="w-1 h-4 bg-[#ffe066] rounded animate-voice-wave [animation-delay:0.3s]" />
                            <span className="w-1 h-2 bg-[#ff1e2d] rounded animate-voice-wave [animation-delay:0.45s]" />
                          </div>
                          <span className="text-[10px] font-mono text-[#ffc400] font-bold uppercase animate-pulse">
                            Speaking
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1 opacity-30">
                            <span className="w-1 h-1.5 bg-zinc-600 rounded" />
                            <span className="w-1 h-1.5 bg-zinc-600 rounded" />
                            <span className="w-1 h-1.5 bg-zinc-600 rounded" />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            Listening
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Sample Speech Bubble Preview */}
            <div className="mt-5 p-3.5 rounded-xl bg-[#190d16] border border-[#ffc400]/40 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ffc400] mt-1.5 shrink-0 animate-ping" />
              <div className="text-xs text-amber-100 font-mono italic leading-relaxed">
                {sampleQuotes[activeSpeakerIndex]}
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-4 text-center">
              <span className="text-[11px] font-mono text-zinc-400">
                Dynamic turn-taking • Real-time interruption dynamics • Low latency
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
