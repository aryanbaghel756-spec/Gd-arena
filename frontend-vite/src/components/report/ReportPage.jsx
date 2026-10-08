import React, { useState, useEffect, useRef } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { Button } from '../common/Button';
import { ActionableFeedback } from './ActionableFeedback';
import { FullTranscriptViewer } from './FullTranscriptViewer';
import {
  Award,
  Clock,
  MessageCircle,
  Zap,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Printer,
  ArrowRight,
  TrendingUp,
  Percent,
} from 'lucide-react';

export function ReportPage() {
  const { currentReport, navigate, startSession, topic } = useDiscussion();
  const [highlightedTimestamp, setHighlightedTimestamp] = useState(null);

  // Animated numbers
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedSpeakingTime, setAnimatedSpeakingTime] = useState(0);
  const [animatedIdeas, setAnimatedIdeas] = useState(0);
  const [animatedInterruptions, setAnimatedInterruptions] = useState(0);

  const report = currentReport || {
    score: 82,
    subtitle: 'Strong performance with opportunities to improve interaction and clarity.',
    topic: topic || 'Should AI replace human jobs?',
    metrics: {
      speakingTimePct: 32,
      ideasContributed: 7,
      interruptions: 2,
      discussionTime: '05:00',
    },
    skills: [
      { name: 'CLARITY', score: 4.2, max: 5.0, desc: 'Logical sentence progression and clear diction' },
      { name: 'CONFIDENCE', score: 4.0, max: 5.0, desc: 'Tone firmness and minimal filler hesitation' },
      { name: 'LISTENING', score: 3.5, max: 5.0, desc: 'Patience before interjections and active synthesis' },
      { name: 'RELEVANCE', score: 4.4, max: 5.0, desc: 'Strict adherence to prompt core issues' },
      { name: 'OPENING', score: 4.1, max: 5.0, desc: 'Framework framing and agenda structuring' },
      { name: 'BUILDING ON OTHERS', score: 3.8, max: 5.0, desc: 'Synthesizing previous cohort perspectives' },
    ],
    transcript: [
      { id: '1', timestamp: '00:08', speaker: 'Moderator', color: '#a855f7', text: "Welcome participants to today's group discussion on 'Should AI replace human jobs?'. Let's maintain constructive dialogue." },
      { id: '2', timestamp: '00:18', speaker: 'Aarav', color: '#3b82f6', text: "If we examine historical labor trends, automation shifts tasks toward higher-order analytical decision making." },
      { id: '3', timestamp: '00:32', speaker: 'Kabir', color: '#f97316', text: "But the short-term displacement problem cannot be ignored. Real households cannot survive on theoretical long-term equilibrium." },
      { id: '4', timestamp: '00:52', speaker: 'You', color: '#38bdf8', text: "I believe AI will create new jobs by augmenting human work rather than completely replacing human oversight." },
      { id: '5', timestamp: '01:15', speaker: 'Meera', color: '#ec4899', text: "Creative inquiry and emotional intelligence remain deeply human frontiers that algorithms can assist but never replace." },
      { id: '6', timestamp: '01:42', speaker: 'You', color: '#38bdf8', text: "Building on Aarav's point regarding structural job migration, the critical requirement is paired institutional training so workers transition into new roles rather than facing displacement." },
      { id: '7', timestamp: '02:20', speaker: 'Ananya', color: '#10b981', text: "I agree with the point made by both our teammates. Proactive public policy paired with responsible adoption ensures inclusive growth." },
      { id: '8', timestamp: '02:48', speaker: 'Rohan', color: '#eab308', text: "First-mover advantage determines which organizations and economies lead the coming century. Hesitation is the biggest cost." },
      { id: '9', timestamp: '03:14', isInterruption: true, interruptedSpeaker: 'Kabir', text: 'YOU INTERRUPTED KABIR' },
      { id: '10', timestamp: '03:16', speaker: 'You', color: '#38bdf8', text: "Wait, but that ignores the transition timeline completely! We must establish accountability guardrails today." },
      { id: '11', timestamp: '03:50', speaker: 'Kabir', color: '#f97316', text: "Fair challenge, but accountability mechanisms without legal penalties remain empty rhetoric." },
      { id: '12', timestamp: '04:30', speaker: 'Moderator', color: '#a855f7', text: "We have reached the end of our discussion time. Excellent participation, proactive counter-arguments, and mutual engagement." },
    ],
  };

  const targetScore = report.score || 82;
  const targetSpeaking = report.metrics?.speakingTimePct || 32;
  const targetIdeas = report.metrics?.ideasContributed || 7;
  const targetInterruptions = report.metrics?.interruptions ?? 2;

  // Counter animation
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();

    function step(timestamp) {
      const progress = Math.min(1, (timestamp - start) / duration);
      setAnimatedScore(Math.round(progress * targetScore));
      setAnimatedSpeakingTime(Math.round(progress * targetSpeaking));
      setAnimatedIdeas(Math.round(progress * targetIdeas));
      setAnimatedInterruptions(Math.round(progress * targetInterruptions));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }, [targetScore, targetSpeaking, targetIdeas, targetInterruptions]);

  function handlePracticeAgain() {
    startSession({
      selectedTopic: report.topic || topic,
      selectedAiCount: 4,
      selectedDuration: 5,
    });
  }

  function handleExportReport() {
    window.print();
  }

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 select-none pb-20">
      {/* 1. REPORT HERO HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-mono font-semibold text-pink-300 mb-3">
            <span>PERFORMANCE INTELLIGENCE</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            YOUR GD PERFORMANCE
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-xl font-normal">
            {report.subtitle || 'Strong performance with opportunities to improve interaction and clarity.'}
          </p>
          <p className="text-xs font-mono text-slate-400 mt-1">
            TOPIC: <span className="text-slate-200">{report.topic}</span>
          </p>
        </div>

        {/* Big Overall Score Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#1d162a] to-[#0c0d14] border border-pink-500/40 shadow-[0_0_25px_rgba(244,63,94,0.18)] flex items-center gap-5 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              OVERALL RATING
            </span>
            <div className="font-heading font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-none mt-1">
              {animatedScore}
              <span className="text-lg sm:text-xl font-bold text-slate-400"> / 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Award size={26} />
          </div>
        </div>
      </header>

      {/* 2. TOP METRICS CARDS */}
      <section>
        <div className="text-xs font-heading font-bold text-slate-300 uppercase tracking-wider mb-3">
          TOP METRICS
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Speaking Time */}
          <div className="glass-panel p-4 sm:p-5 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                SPEAKING TIME
              </span>
              <Percent size={14} className="text-pink-400" />
            </div>
            <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
              {animatedSpeakingTime}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ideal target range: 25% – 35%</p>
          </div>

          {/* Ideas Contributed */}
          <div className="glass-panel p-4 sm:p-5 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                IDEAS CONTRIBUTED
              </span>
              <Lightbulb size={14} className="text-amber-400" />
            </div>
            <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
              {animatedIdeas}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Distinct analytical points framed</p>
          </div>

          {/* Interruptions */}
          <div className="glass-panel p-4 sm:p-5 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                INTERRUPTIONS
              </span>
              <Zap size={14} className="text-violet-400" />
            </div>
            <div className="font-heading font-bold text-2xl sm:text-3xl text-white">
              {animatedInterruptions}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Strategic interjections during debate</p>
          </div>

          {/* Discussion Time */}
          <div className="glass-panel p-4 sm:p-5 rounded-xl bg-arena-surface/80 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                DISCUSSION TIME
              </span>
              <Clock size={14} className="text-sky-400" />
            </div>
            <div className="font-heading font-bold text-2xl sm:text-3xl text-white font-mono">
              {report.metrics?.discussionTime || '05:00'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total session elapsed duration</p>
          </div>
        </div>
      </section>

      {/* 3. SKILL ANALYSIS (6 Progress Visuals) */}
      <section className="glass-panel p-6 rounded-xl bg-arena-surface/70 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              SKILL ANALYSIS
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated across 6 foundational discussion criteria
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Target: 5.0 Scale</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {(report.skills || []).map((skill) => {
            const pct = (skill.score / skill.max) * 100;
            return (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-bold text-slate-200">
                    {skill.name}
                  </span>
                  <span className="font-mono font-bold text-pink-400">
                    {skill.score.toFixed(1)} <span className="text-slate-400 font-normal">/ {skill.max.toFixed(1)}</span>
                  </span>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">{skill.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ACTIONABLE FEEDBACK */}
      <section>
        <ActionableFeedback
          onTimestampClick={(ts) => {
            setHighlightedTimestamp(ts);
            // smooth scroll to transcript section
            const el = document.getElementById('full-transcript-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </section>

      {/* 5. FULL TRANSCRIPT EXPLORER */}
      <section id="full-transcript-section" className="scroll-mt-20">
        <FullTranscriptViewer
          transcript={report.transcript}
          highlightedTimestamp={highlightedTimestamp}
        />
      </section>

      {/* 6. FINAL ACTIONS - STRICT HIERARCHY */}
      <footer className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Secondary: CHANGE TOPIC */}
          <Button
            variant="secondary"
            onClick={() => navigate('setup')}
            size="default"
          >
            CHANGE TOPIC
          </Button>

          {/* Secondary: VIEW TRANSCRIPT jump */}
          <Button
            variant="secondary"
            onClick={() => {
              const el = document.getElementById('full-transcript-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            size="default"
          >
            VIEW TRANSCRIPT
          </Button>

          {/* Optional: EXPORT REPORT */}
          <Button
            variant="secondary"
            icon={Printer}
            iconPosition="left"
            onClick={handleExportReport}
            size="default"
          >
            EXPORT REPORT
          </Button>
        </div>

        {/* Primary Dominant CTA: PRACTICE AGAIN */}
        <Button
          variant="primary"
          size="large"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handlePracticeAgain}
          className="!px-8 text-sm"
        >
          PRACTICE AGAIN
        </Button>
      </footer>
    </div>
  );
}
