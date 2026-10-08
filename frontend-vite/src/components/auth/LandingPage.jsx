import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDiscussion } from '../../context/DiscussionContext';
import { HeroArenaVisual } from './HeroArenaVisual';
import { Button } from '../common/Button';
import { CONFIG } from '../../data/config';
import { ttsService } from '../../services/speechSynthesis';
import {
  Users2,
  Mic,
  BarChart3,
  ArrowRight,
  Sparkles,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  PlayCircle,
  HelpCircle,
  Compass
} from 'lucide-react';

export function LandingPage() {
  const { openAuthModal, demoLogin } = useAuth();
  const { navigate, addToast } = useDiscussion();
  const [playingPersona, setPlayingPersona] = useState(null);

  function handleExploreHowItWorks() {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function handlePreviewVoice(personaId, quote) {
    if (playingPersona) {
      ttsService.cancel();
      if (playingPersona === personaId) {
        setPlayingPersona(null);
        return;
      }
    }
    setPlayingPersona(personaId);
    try {
      await ttsService.speak(quote, personaId);
    } finally {
      setPlayingPersona(null);
    }
  }

  // Persona list from specifications
  const personas = [
    {
      id: 'aarav',
      name: 'Aarav',
      role: 'Analyst',
      color: '#3B82F6',
      badge: 'Logical & Fact-Focused',
      summary: 'Structures arguments with empirical data, economic trends, and cause-and-effect reasoning.',
      sampleQuote: 'If we examine historical labor trends, automation shifts tasks toward higher-order analytical decision making.',
      avatarLetter: 'A'
    },
    {
      id: 'meera',
      name: 'Meera',
      role: 'Creative',
      color: '#EC4899',
      badge: 'Innovative & Big-Picture',
      summary: 'Champions human potential, big-picture horizons, lateral problem-solving, and societal evolution.',
      sampleQuote: 'Beyond immediate output numbers, we must examine how creative tools redefine empathy and cultural connection.',
      avatarLetter: 'M'
    },
    {
      id: 'kabir',
      name: 'Kabir',
      role: 'Critic',
      color: '#F97316',
      badge: 'Skeptical & Challenging',
      summary: 'Rigorously questions superficial consensus, finds edge-case flaws, and demands proof.',
      sampleQuote: 'That sounds promising, but where is the empirical proof that displaced workers are absorbed without wage depreciation?',
      avatarLetter: 'K'
    },
    {
      id: 'ananya',
      name: 'Ananya',
      role: 'Collaborator',
      color: '#10B981',
      badge: 'Balanced & Supportive',
      summary: 'Synthesizes divergent viewpoints, bridges conflicting points, and builds common ground.',
      sampleQuote: 'Building on both Aarav and Meera\'s observations, pairing transition safety nets with localized upskilling creates sustainable balance.',
      avatarLetter: 'N'
    },
    {
      id: 'rohan',
      name: 'Rohan',
      role: 'Debater',
      color: '#EAB308',
      badge: 'Assertive & Persuasive',
      summary: 'Drives momentum with rhetoric, conviction, real-world case studies, and structured counter-points.',
      sampleQuote: 'First-mover advantage determines who leads this transformation; hesitation is our single largest collective liability.',
      avatarLetter: 'R'
    },
    {
      id: 'moderator',
      name: 'Moderator',
      role: 'Facilitator',
      color: '#A855F7',
      badge: 'Facilitator',
      summary: 'Controls discussion flow, manages turn-taking, regulates speaking time, and guides conclusions.',
      sampleQuote: 'Welcome participants. Let us maintain balanced dialogue, listen actively, and ground our arguments in evidence.',
      avatarLetter: 'M'
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Tagline, Value Proposition, Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-pink-500/30 text-xs font-mono text-pink-300 mb-6 shadow-[0_0_15px_rgba(244,63,94,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span>PRACTICE. SPEAK. IMPROVE.</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
              Your Next GD <br />
              <span className="gradient-text">Starts Here.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl font-normal">
              Practice realistic group discussions with AI participants, sharpen your communication skills, and understand exactly how you performed.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Button
                variant="primary"
                size="large"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('setup')}
                className="w-full sm:w-auto text-sm"
              >
                START GD
              </Button>

              <Button
                variant="secondary"
                size="large"
                onClick={handleExploreHowItWorks}
                className="w-full sm:w-auto text-sm"
              >
                EXPLORE EXPERIENCE
              </Button>
            </div>

            {/* Credibility Micro-Details */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-pink-400" />
                <span>Voice-First Turn Taking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-violet-400" />
                <span>Realistic Interruption Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-sky-400" />
                <span>Instant Diagnostic Scoring</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Connected AI Discussion Nodes */}
          <div className="lg:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0">
            <HeroArenaVisual />
          </div>
        </div>
      </section>

      {/* 2. THREE FEATURE CARDS */}
      <section className="relative py-16 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Engineered for Realistic Discussion Training
          </h2>
          <p className="text-sm text-slate-400">
            Every layer replicates real campus placements, MBA interviews, and competitive evaluation rounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 01 */}
          <div className="glass-panel p-7 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs font-bold text-pink-400/80 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                01
              </span>
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
                <Users2 size={20} />
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2 tracking-tight">
              AI DISCUSSION PANEL
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Practice with distinct AI personalities that challenge, support, and question your ideas.
            </p>
          </div>

          {/* Card 02 */}
          <div className="glass-panel p-7 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs font-bold text-violet-400/80 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                02
              </span>
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <Mic size={20} />
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2 tracking-tight">
              LIVE VOICE INTERACTION
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Speak naturally using voice interaction with real-time transcription and turn-taking.
            </p>
          </div>

          {/* Card 03 */}
          <div className="glass-panel p-7 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs font-bold text-sky-400/80 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                03
              </span>
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <BarChart3 size={20} />
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2 tracking-tight">
              PERFORMANCE INTELLIGENCE
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Get measurable feedback on clarity, participation, ideas, interruptions, and communication.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PERSONA SHOWCASE */}
      <section className="relative py-16 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider mb-2">
              MEET THE COHORTS
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              AI Discussion Personas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Each persona simulates genuine behavioral dynamics—from skeptical pushback to cooperative synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {personas.map(persona => {
            const isPlaying = playingPersona === persona.id;
            return (
              <div
                key={persona.id}
                className="glass-panel p-5 rounded-xl bg-arena-surface/60 border border-white/10 hover:border-white/20 transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-heading font-extrabold text-sm"
                        style={{
                          backgroundColor: `${persona.color}15`,
                          color: persona.color,
                          border: `1px solid ${persona.color}40`,
                        }}
                      >
                        {persona.avatarLetter}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-white text-base leading-tight">
                          {persona.name}
                        </h4>
                        <span className="text-xs text-slate-400">{persona.role}</span>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${persona.color}10`,
                        color: persona.color,
                        borderColor: `${persona.color}30`,
                      }}
                    >
                      {persona.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {persona.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400 italic truncate flex-1">
                    "{persona.sampleQuote}"
                  </p>
                  <button
                    onClick={() => handlePreviewVoice(persona.id, persona.sampleQuote)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                    title={isPlaying ? "Stop audio" : "Listen to persona voice"}
                  >
                    <Volume2 size={14} className={isPlaying ? "text-pink-400 animate-pulse" : ""} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="relative py-16 px-5 sm:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider mb-2">
            STEP-BY-STEP PROGRESSION
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            How GD Arena Works
          </h2>
          <p className="text-sm text-slate-400">
            A structured path from session configuration to objective skill mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-arena-surface/40 border border-white/5 relative">
            <div className="font-mono text-xs text-slate-400 mb-2">01 / SETUP</div>
            <h4 className="font-heading font-bold text-white mb-2 text-base">Select GD Topic</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick from contemporary tech/economic prompts or enter your own custom placement topic.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-arena-surface/40 border border-white/5 relative">
            <div className="font-mono text-xs text-slate-400 mb-2">02 / CONFIGURE</div>
            <h4 className="font-heading font-bold text-white mb-2 text-base">Choose Participants</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set 3, 4, or 5 AI participants to simulate small or high-density discussion panels.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-arena-surface/40 border border-white/5 relative">
            <div className="font-mono text-xs text-slate-400 mb-2">03 / SPEAK</div>
            <h4 className="font-heading font-bold text-white mb-2 text-base">Debate & Interrupt</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use voice push-to-talk. Interject strategically when AI points lack substantiation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-arena-surface/40 border border-white/5 relative">
            <div className="font-mono text-xs text-slate-400 mb-2">04 / EVALUATE</div>
            <h4 className="font-heading font-bold text-white mb-2 text-base">Review Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive 6 core skill ratings, speaking share analysis, and timestamped actionable feedback.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="primary"
            size="large"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('setup')}
          >
            START GD
          </Button>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="pt-16 pb-8 border-t border-white/5 max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-white">GD ARENA</span>
          <span>—</span>
          <span>Practice. Speak. Improve.</span>
        </div>
        <div>
          Production Frontend build • Built for realistic student communication training
        </div>
      </footer>
    </div>
  );
}
