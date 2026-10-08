'use client';

import React, { useState } from 'react';
import { 
  Mic, 
  BrainCircuit, 
  Volume2, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  ArrowRight, 
  Layers, 
  RotateCcw,
  CheckCircle2,
  Terminal,
  Server,
  Zap,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { HexButton } from '../ui/HexButton';
import { RectButton } from '../ui/RectButton';

interface PipelineArchitectureProps {
  onBack: () => void;
  onStartGD: () => void;
}

export function PipelineArchitecture({ onBack, onStartGD }: PipelineArchitectureProps) {
  const [selectedStage, setSelectedStage] = useState<number>(0);

  const pipelineStages = [
    {
      id: 'voice-stt',
      number: '01',
      title: 'Voice Input & Local Speech-to-Text',
      tagline: 'Student ki aawaz ko live text me convert karta hai',
      icon: Mic,
      accent: '#ff1e2d',
      bgGlow: 'rgba(255, 30, 45, 0.2)',
      details: [
        { label: 'Technology', value: 'Browser Web Speech API + Push-to-Talk + Live Decibel Meter' },
        { label: 'Latency', value: '<150ms real-time audio chunking' },
        { label: 'Privacy', value: '100% Client-Side Voice Processing (No paid cloud audio APIs)' }
      ],
      description: 'Student jaise hi mic on karta hai ya Spacebar hold karta hai, audio stream real-time me capture hokar text me transcribe hoti hai. Sath me volume meter detect karta hai ki student bol raha hai ya pause liya hai.',
      hinglishSummary: 'Aap jo mic me bolte ho, system usko turant sun kar bina kisi delay ke text me convert karta hai taaki AI peers samajh sakein.'
    },
    {
      id: 'moderator-turn',
      number: '02',
      title: 'Smart Turn-Taking & Moderator AI',
      tagline: 'Natural debate flow maintain karta hai (No robotic turns)',
      icon: Layers,
      accent: '#ffc400',
      bgGlow: 'rgba(255, 196, 0, 0.2)',
      details: [
        { label: 'Architecture', value: 'Heuristic State Engine + Dynamic Turn Manager' },
        { label: 'Turn Logic', value: 'Contextual (Aggressive peer counters, Collaborator balances, Critic tests risks)' },
        { label: 'Interruption Protocol', value: 'Respectful floor recovery with polite phrases' }
      ],
      description: 'Koi fixed rotation nahi hai (jaise Student -> AI -> Student). Agar student ne bold claim kiya toh Critic (Kabir) counter karega; agar do log disagree karein toh Collaborator (Ananya) bridge banayegi; aur Moderator (Dr. Verma) ensure karega ki koi floor monopolize na kare.',
      hinglishSummary: 'Ye system decide karta hai ki agla kaun bolega taaki discussion ek real GD lage, robotic question-answer bot nahi.'
    },
    {
      id: 'ollama-llm',
      number: '03',
      title: 'Local Ollama LLM & 5 Personas',
      tagline: 'Ek hi local open-weight model se 5 alag personalities chalti hain',
      icon: BrainCircuit,
      accent: '#ff4d5a',
      bgGlow: 'rgba(255, 77, 90, 0.2)',
      details: [
        { label: 'Model', value: 'Local Ollama (Llama-3 / Mistral / Qwen) or Cloud Fallback Router' },
        { label: 'Personas', value: 'Aarav (Analyst), Meera (Creative), Kabir (Critic), Ananya (Collaborator), Rohan (Debater)' },
        { label: 'Output Length', value: 'Strict 1-3 conversational sentences (realistic GD style)' }
      ],
      description: 'Multiple heavy models chalane ki zaroorat nahi hai. Ek single local model me structured system prompts aur shared conversation memory inject ki jati hai, jisse har participant ka distinct behavioral nuance aata hai.',
      hinglishSummary: 'Aapke laptop par chalne wala ek hi AI model alag-alag dosto (Analyst, Creative, Critic, Collaborator, Debater) ke roop me bolta hai.'
    },
    {
      id: 'facts-db',
      number: '04',
      title: 'Institutional Facts & Anti-Hallucination DB',
      tagline: 'Zero false facts: SEBI, WEF, Stanford, AICTE ground truth',
      icon: ShieldCheck,
      accent: '#00d26a',
      bgGlow: 'rgba(0, 210, 106, 0.2)',
      details: [
        { label: 'Sources', value: 'SEBI 93% F&O study, WEF 85M/97M job report, Stanford Nicholas Bloom 13% data' },
        { label: 'Guardrail', value: 'Pre-Debate Fact Injection into LLM Context' },
        { label: 'Fallacy Radar', value: 'Detects False Dichotomies, Slippery Slopes, and Unsupported Claims' }
      ],
      description: 'AI kabhi fake numbers ya imaginary data quote nahi karega. Discussion shuru hone se pehle verified institutional statistics context me inject hoti hain, jisse students ko authentic data yaad hota hai.',
      hinglishSummary: 'Sabhi facts official reports se verified hain, isliye na AI jhooth bolta hai aur na student ko koi galat data seekhna padta hai.'
    },
    {
      id: 'copilot-hud',
      number: '05',
      title: 'Live Co-Pilot HUD & Doubt Resolution',
      tagline: 'Live screen par tactical hints aur jab tak doubt clear na ho, GD chalega',
      icon: Zap,
      accent: '#00c3ff',
      bgGlow: 'rgba(0, 195, 255, 0.2)',
      details: [
        { label: 'Tactical Whispers', value: 'Real-time prompts: Kaise counter karein, kaunsa data point use karein' },
        { label: 'Doubt Engine', value: 'Timer automatically extends until student marks [✓ Samajh Gaya]' },
        { label: 'Real-time Radar', value: 'Instant alert if discussion is deviating from core agenda' }
      ],
      description: 'Discussion ke dauraan screen par ek smart Co-Pilot chalta hai jo student ko whisper karta hai ki agla counter kaise dena hai. Agar student ka doubt clear nahi hua, toh session auto-extend ho jata hai.',
      hinglishSummary: 'Ye aapka digital mentor hai jo live GD me kaan me batata hai ki agla point kya bolna hai aur doubt solve hone tak GD khatam nahi hone deta.'
    },
    {
      id: 'tts-audio',
      number: '06',
      title: 'Text-to-Speech & Audio Streaming',
      tagline: 'AI participants natural human voice me bolte hain',
      icon: Volume2,
      accent: '#ffa834',
      bgGlow: 'rgba(255, 168, 52, 0.2)',
      details: [
        { label: 'Engine', value: 'Web Speech Synthesis API with pitch & rate modulation' },
        { label: 'Voice Tuning', value: 'Aarav (Calm Male), Meera (Warm Female), Kabir (Grounded Male), Ananya (Smooth Female)' },
        { label: 'Visual Sync', value: 'Hexagonal node waveform aura synchronizes with audio packets' }
      ],
      description: 'Jaise hi AI turn generate hoti hai, text turant speech me convert hokar speaker node par glowing waveform animate karta hai. Student ko lagta hai ki real candidate speak kar raha hai.',
      hinglishSummary: 'AI text likhta nahi, balki natural aawaz me bolta hai taaki aapko actual physical GD room ka feel mile.'
    },
    {
      id: 'evaluator-report',
      number: '07',
      title: 'Post-GD Evaluator & Evidence Replay',
      tagline: '0-100 rubric, "What You Could Have Said", aur personalized plan',
      icon: Award,
      accent: '#ff1e2d',
      bgGlow: 'rgba(255, 30, 45, 0.2)',
      details: [
        { label: 'Rubric (0-100)', value: 'Starting, Ideas, Building, Listening, Interruptions, Ending' },
        { label: 'Evidence Engine', value: 'Direct quote sanitization: Har score ke piche transcript ka exact proof' },
        { label: 'Improvement Plan', value: 'Sabse bada focus area, agle 3 goals, aur daily practice challenge' }
      ],
      description: 'GD khatam hone ke baad generic feedback nahi milta. System actual transcript analyse karke batata hai: "Kabir ne ye bola, aapne ye bola, jabki placement topper ye bolta."',
      hinglishSummary: 'GD ke baad exact score milta hai aur topper ki tarah bolne ka side-by-side comparison milta hai.'
    },
    {
      id: 'sqlite-memory',
      number: '08',
      title: 'Student Long-Term Memory & SQLite Persistence',
      tagline: 'Session 1, 2, 3 ke scores aur personalized learning roadmap track hota hai',
      icon: Database,
      accent: '#9d4edd',
      bgGlow: 'rgba(157, 78, 221, 0.2)',
      details: [
        { label: 'Storage', value: 'Persistent SQLite Database (gd_arena.db)' },
        { label: 'Progress Tracking', value: 'Multi-session trend line (Speaking, Listening, Ideas improvement %)' },
        { label: 'Mastery Milestones', value: 'Next recommended topics based on historical weaknesses' }
      ],
      description: 'Student ke sabhi sessions permanently store hote hain. Agli baar jab student aata hai, AI ko pata hota hai ki student kis topic me weak tha aur use customized practice deta hai.',
      hinglishSummary: 'Aapke sabhi sessions safe rehte hain taaki aap dekh sako ki aapka score Session 1 se Session 3 tak kitna improve hua.'
    }
  ];

  return (
    <div className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1b0e17] border border-[#ff1e2d]/50 text-xs font-mono text-[#ffc400] shadow-[0_0_15px_rgba(255,30,45,0.3)]">
          <Server className="w-3.5 h-3.5 text-[#ff1e2d] animate-pulse" />
          <span>END-TO-END SYSTEM PIPELINE & ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight uppercase">
          How GD Arena <span className="bg-gradient-to-r from-[#ff1e2d] via-amber-300 to-[#ffc400] bg-clip-text text-transparent">Works</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
          Voice capture se lekar local Ollama LLM, anti-hallucination factual guardrails aur placement-grade evaluation tak ka complete architecture.
        </p>
      </div>

      {/* Interactive Pipeline Diagram (Horizontal Flow on Desktop, Vertical on Mobile) */}
      <div className="rounded-2xl bg-[#0c070c]/90 border border-[#ff1e2d]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#291724]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ffc400]" />
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Interactive 8-Stage Execution Pipeline
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Click any stage to inspect inner mechanics
          </span>
        </div>

        {/* Stages Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {pipelineStages.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = selectedStage === idx;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(idx)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 group ${
                  isSelected
                    ? 'bg-[#220f1c] border-[#ffc400] shadow-[0_0_20px_rgba(255,196,0,0.3)] scale-102'
                    : 'bg-[#120810] border-[#291724] hover:border-[#ff1e2d]/50 hover:bg-[#180b15]'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-[#ffc400]' : 'text-zinc-500'}`}>
                  {stg.number}
                </span>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center my-1.5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: isSelected ? stg.bgGlow : '#1a0d17', color: stg.accent }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-display font-bold truncate max-w-full ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                  {stg.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        {(() => {
          const cur = pipelineStages[selectedStage];
          const Icon = cur.icon;
          return (
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#180a14] via-[#10070e] to-[#0a0508] border border-[#ff1e2d]/40 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2d1825]">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: cur.bgGlow, color: cur.accent, border: `1px solid ${cur.accent}50` }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#ffc400]">
                        STAGE {cur.number}
                      </span>
                      <h4 className="font-display font-extrabold text-lg sm:text-xl text-white">
                        {cur.title}
                      </h4>
                    </div>
                    <p className="text-xs text-amber-200/80 font-mono">
                      {cur.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    ✓ Production Ready
                  </span>
                </div>
              </div>

              {/* Description & Hinglish summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                    TECHNICAL ARCHITECTURE
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {cur.description}
                  </p>
                </div>

                <div className="space-y-2 p-3.5 rounded-lg bg-[#200f1c] border border-[#ffc400]/30">
                  <span className="text-[10px] font-mono uppercase text-[#ffc400] font-bold tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    SIMPLE HINGLISH EXPLANATION
                  </span>
                  <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
                    "{cur.hinglishSummary}"
                  </p>
                </div>
              </div>

              {/* Spec details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {cur.details.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#0e070d] border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                      {d.label}
                    </span>
                    <span className="text-xs font-mono text-zinc-200 font-semibold block">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>

      {/* High-Level Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: 100% Local & Laptop-Ready */}
        <div className="p-6 rounded-2xl bg-[#0f090e]/90 border border-[#ff1e2d]/30 backdrop-blur-xl space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-[#ff1e2d]/20 text-[#ff1e2d] border border-[#ff1e2d]/40 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-white uppercase tracking-wide">
            1. Laptop-Ready Architecture
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Serverless ya cloud GPU ki zaroorat nahi. Local Ollama engine laptop par directly run hota hai. Agar Ollama band ho, toh dynamic mock engine seamlessly fallback sambhalta hai.
          </p>
          <div className="pt-2 text-[11px] font-mono text-[#ffc400]">
            FastAPI + SQLite + Next.js Standalone
          </div>
        </div>

        {/* Card 2: 5 AI Personas, 1 Model */}
        <div className="p-6 rounded-2xl bg-[#0f090e]/90 border border-[#ffc400]/30 backdrop-blur-xl space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-[#ffc400]/20 text-[#ffc400] border border-[#ffc400]/40 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-white uppercase tracking-wide">
            2. 5 Distinct AI Personas
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Aarav (Analyst), Meera (Creative), Kabir (Critic), Ananya (Collaborator), aur Rohan (Debater) ek doosre ki baaton par react karte hain, human ki tareef ya counter karte hain.
          </p>
          <div className="pt-2 text-[11px] font-mono text-emerald-400">
            Real Multi-Party Group Dynamic
          </div>
        </div>

        {/* Card 3: Placement-Grade Report */}
        <div className="p-6 rounded-2xl bg-[#0f090e]/90 border border-emerald-500/30 backdrop-blur-xl space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-white uppercase tracking-wide">
            3. Placement-Grade Audit
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            0-100 evaluation rubric ke sath side-by-side comparison: "Aapne kya bola aur topper kya bolta". Har point transcript quotes se verified rehta hai bina kisi fake feedback ke.
          </p>
          <div className="pt-2 text-[11px] font-mono text-amber-300">
            Zero Generic Praise, 100% Actionable
          </div>
        </div>

      </div>

      {/* Bottom CTA Dock */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#180a13] via-[#240e1b] to-[#140810] border border-[#ffc400]/40 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_0_30px_rgba(255,196,0,0.15)]">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-lg text-white">
            Ready to test GD Arena in action?
          </h3>
          <p className="text-xs text-zinc-300 font-mono">
            Topic select karein, mic arm karein aur AI panel ke sath debate karein.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RectButton
            variant="secondary"
            size="md"
            onClick={onBack}
          >
            Back to Home
          </RectButton>

          <HexButton
            variant="primary"
            size="md"
            onClick={onStartGD}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Start Practice
          </HexButton>
        </div>
      </div>

    </div>
  );
}
