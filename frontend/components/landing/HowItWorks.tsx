'use client';

import React from 'react';
import { Target, Mic, FileText, ArrowRight, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { HexButton } from '../ui/HexButton';

interface HowItWorksProps {
  onStartGD: () => void;
}

export function HowItWorks({ onStartGD }: HowItWorksProps) {
  const steps = [
    {
      step: '01',
      title: 'Pick Topic & Panel',
      subtitle: 'Custom setup in seconds',
      description: 'Select from real-world Abstract, Case-based, Controversial, or Current Affairs topics—or type your own. Configure 3 to 5 AI participants with distinct personalities and an autonomous moderator.',
      icon: Target,
      accent: 'border-[#ff1e2d] text-[#ff1e2d]',
      glow: 'group-hover:border-[#ff1e2d] group-hover:shadow-[0_0_25px_rgba(255,30,45,0.4)]',
      highlights: ['Custom or curated topics', 'Configurable panel dynamics', 'Always-on moderator']
    },
    {
      step: '02',
      title: 'Speak & Navigate Turns',
      subtitle: 'Voice-first active arena',
      description: 'Use Push-to-Talk or open mic to articulate your points. Defend against interruptions from aggressive dominators, build on analytical points, and practice commanding the room under pressure.',
      icon: Mic,
      accent: 'border-[#ffc400] text-[#ffc400]',
      glow: 'group-hover:border-[#ffc400] group-hover:shadow-[0_0_25px_rgba(255,196,0,0.4)]',
      highlights: ['Real-time voice synthesis', 'Polite interrupt protocol', 'Live time-share tracker']
    },
    {
      step: '03',
      title: 'Get Honest Feedback',
      subtitle: 'Objective rubric evaluation',
      description: 'Receive an instant comprehensive audit scored across 6 critical dimensions (Starting, Idea Quality, Building, Listening, Handling Interruptions, Ending). Every score links directly to exact timestamped quotes.',
      icon: FileText,
      accent: 'border-[#ffe066] text-[#ffe066]',
      glow: 'group-hover:border-[#ffe066] group-hover:shadow-[0_0_25px_rgba(255,224,102,0.4)]',
      highlights: ['6 evaluated competencies', 'Expandable transcript proof', 'Speaking share breakdown']
    }
  ];

  return (
    <section id="how-it-works" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c0f18] border border-[#ff1e2d]/40 text-xs font-mono text-[#ffc400]">
          <Zap className="w-3.5 h-3.5 text-[#ff1e2d]" />
          <span>THREE-STEP MASTERY WORKFLOW</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white uppercase tracking-tight">
          How It <span className="bg-gradient-to-r from-[#ff1e2d] to-[#ffc400] bg-clip-text text-transparent">Works</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400">
          From zero preparation to an exhaustive performance evaluation in under 10 minutes.
        </p>
      </div>

      {/* 3 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`
                group relative p-8 rounded-2xl bg-[#0f0a10]/85 border border-[#2a1724]
                backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5
                ${item.glow}
              `}
            >
              {/* Step Number Top Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#1c0f18] text-[#ffc400] border border-[#ff1e2d]/30">
                  STEP {item.step}
                </span>

                <div className={`w-12 h-12 rounded-xl bg-[#160c14] border flex items-center justify-center transition-transform group-hover:scale-110 ${item.accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1 mb-3">
                <h3 className="font-display font-bold text-xl text-white tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs font-mono text-amber-200/70 uppercase">
                  {item.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Feature bullets */}
              <div className="space-y-2 pt-4 border-t border-[#23141f]">
                {item.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ffc400] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Call to Action strip */}
      <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#170a13] via-[#220d1c] to-[#170a13] border border-[#ff1e2d]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-wide">
            Ready to test your discussion instincts?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Choose a topic, calibrate your AI panel, and step into the round table.
          </p>
        </div>
        <HexButton
          variant="primary"
          size="md"
          onClick={onStartGD}
          icon={<ChevronRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Launch Session
        </HexButton>
      </div>

    </section>
  );
}
