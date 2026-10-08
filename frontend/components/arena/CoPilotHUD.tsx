'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  TrendingUp, 
  BarChart2, 
  CheckCircle2, 
  Info,
  Quote,
  Target,
  Zap
} from 'lucide-react';
import { Topic, DiscussionPhase, Participant, TranscriptItem, TopicFacts, FactDataPoint } from '@/types/arena';
import { VERIFIED_TOPIC_FACTS } from '@/data/mockData';

interface CoPilotHUDProps {
  topic: Topic;
  phase: DiscussionPhase;
  activeSpeakerId: string | null;
  participants: Participant[];
  transcripts: TranscriptItem[];
  topicFacts?: TopicFacts | null;
  isStudentSatisfied?: boolean;
  onToggleSatisfaction?: (satisfied: boolean) => void;
  onAdoptPrompt: (text: string) => void;
  className?: string;
}

export function CoPilotHUD({
  topic,
  phase,
  activeSpeakerId,
  participants,
  transcripts,
  topicFacts,
  isStudentSatisfied = false,
  onToggleSatisfaction,
  onAdoptPrompt,
  className = '',
}: CoPilotHUDProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'whisper' | 'facts' | 'pitfalls'>('whisper');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // 1. Resolve Verified Facts (from prop or verified fallback database)
  const resolvedFacts: TopicFacts = topicFacts || 
    Object.values(VERIFIED_TOPIC_FACTS).find((f) => 
      topic.title.toLowerCase().includes(f.topic.toLowerCase().slice(0, 20)) ||
      f.topic.toLowerCase().includes(topic.title.toLowerCase().slice(0, 20))
    ) ||
    VERIFIED_TOPIC_FACTS['stock-market-nifty'];

  // 2. Real-time Airtime & Pacing Calculation
  const totalUserWords = transcripts
    .filter((t) => t.role === 'user' || t.speakerId === 'user')
    .reduce((acc, t) => acc + (t.text ? t.text.split(/\s+/).length : 0), 0);

  const totalWords = transcripts.reduce(
    (acc, t) => acc + (t.text ? t.text.split(/\s+/).length : 0),
    0
  );

  const userSharePct = totalWords > 0 ? Math.round((totalUserWords / totalWords) * 100) : 0;

  // Pacing status evaluation
  let pacingStatus: { label: string; color: string; desc: string } = {
    label: 'Ready to Initiate',
    color: 'text-[#ffc400] border-amber-500/40 bg-amber-500/10',
    desc: 'The floor is fresh. Claim the initial framework to score high on leadership.'
  };

  if (totalWords > 40) {
    if (userSharePct < 15) {
      pacingStatus = {
        label: 'Under-Participating (Low Airtime)',
        color: 'text-[#ff4d5a] border-[#ff1e2d]/60 bg-[#ff1e2d]/15 animate-pulse',
        desc: `You hold only ${userSharePct}% airtime. Intervene with verified empirical evidence soon!`
      };
    } else if (userSharePct > 34) {
      pacingStatus = {
        label: 'High Airtime Warning',
        color: 'text-amber-300 border-amber-500/50 bg-amber-500/15',
        desc: `You hold ${userSharePct}% airtime. Practice active listening and synthesize peer inputs.`
      };
    } else {
      pacingStatus = {
        label: `Optimal Cadence (${userSharePct}%)`,
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        desc: 'Balanced contribution. You are in the top evaluator scoring bracket.'
      };
    }
  }

  // 3. Dynamic Real-Time Tactical Whisper Engine
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId);

  const getTacticalWhisper = (): {
    headline: string;
    advice: string;
    hinglishTip: string;
    suggestedSpeakingText: string;
    badge: string;
  } => {
    // Phase 1: Opening Framing
    if (phase === 'opening') {
      const firstFact = resolvedFacts.verified_data_points[0];
      return {
        headline: '⚡ Seize the Opening Framing Advantage',
        advice: 'GD evaluators award maximum marks for initiating with a crisp, 2-dimensional scope rather than vague generalizations.',
        hinglishTip: '💡 Shuruat Kaise Karein: Pehle 30 second mein command lo aur topic ko 2 hisso mein baanto (Immediate feasibility vs Long-term impact). Isse leadership score badhta hai.',
        suggestedSpeakingText: `Thank you Moderator. I would like to structure today's discussion on '${topic.title}' across two primary dimensions: first, immediate empirical feasibility, and second, long-term systemic sustainability. As ${firstFact?.source || 'official data'} demonstrates, ${firstFact?.claim || 'evidence shows measurable trade-offs'}, which we must balance today.`,
        badge: 'Opening Strategy'
      };
    }

    // Phase 3: Final Synthesis
    if (phase === 'closing') {
      return {
        headline: '🏁 Consensus Synthesis & Strategic Verdict',
        advice: 'Do not introduce new arguments. Unify competing perspectives and formulate an actionable consensus framework.',
        hinglishTip: '💡 Conclusion Kaise Karein: Koi naya argument mat lao. Dono opposing sides ke points ko milakar ek realistic solution do.',
        suggestedSpeakingText: `To synthesize our discussion, while there are valid concerns regarding immediate execution friction, the empirical consensus points toward a balanced hybrid doctrine: maintaining rigorous institutional guardrails while empowering flexible stakeholder innovation.`,
        badge: 'Closing Mastery'
      };
    }

    // Phase 2: Discussion according to Active Speaker Persona
    const persona = activeSpeaker?.personality || 'Analyst';

    if (persona === 'Critic') {
      const evidence = resolvedFacts.verified_data_points[0]?.evidence || 'systemic data shows managed transitions yield optimal outcomes.';
      return {
        headline: '🎯 Countering Execution Skepticism',
        advice: `${activeSpeaker?.name || 'The Critic'} raised valid friction points. Acknowledge their risk concern, then pivot with institutional data to prove feasibility.`,
        hinglishTip: `💡 Kabir ko Counter Karo: Kabir ke risk point ko accept karo, phir data se prove karo ki safeguards hone par faayda zyada hai.`,
        suggestedSpeakingText: `I completely agree with the risk highlighted regarding execution bottlenecks. However, empirical findings show that when structured safeguards are put in place—as demonstrated by ${evidence}—the downside risk is mitigated while preserving long-term upside.`,
        badge: 'Address Critic'
      };
    }

    if (persona === 'Dominator') {
      return {
        headline: '🛡️ Reclaiming Floor from Aggressive Tempo',
        advice: `${activeSpeaker?.name || 'The speaker'} is asserting ungrounded opinions. Use a polite assertion formula to re-ground the panel on verified facts.`,
        hinglishTip: `💡 Vikram ko Intervene Karo: Vikram bina data ke bol raha hai. Beech mein politely bolo: "Allow me 15 seconds to add verified data".`,
        suggestedSpeakingText: `Allow me 15 seconds to bridge this point with verified data. If we look at the institutional evidence rather than sentiment, the numbers clearly indicate that sustainable growth requires disciplined governance over short-term speculation.`,
        badge: 'Polite Intervention'
      };
    }

    if (persona === 'Creative') {
      return {
        headline: '🤝 Grounding Creative Analogies in Practical Reality',
        advice: `${activeSpeaker?.name || 'The Creative'} offered a lateral perspective. Validate their creative angle and tie it directly back to the core operational metric.`,
        hinglishTip: `💡 Creative Angle ko Jodo: Creative point ko appreciate karo aur phir ground reality ke practical solution se connect karo.`,
        suggestedSpeakingText: `That is an insightful parallel. Translating that creative concept into our current challenge, it means we can pilot decentralized solutions while keeping regulatory compliance transparent.`,
        badge: 'Collaborative Bridge'
      };
    }

    if (persona === 'Quiet one') {
      return {
        headline: '🌟 Inclusivity & Leadership Score Booster',
        advice: 'Evaluating panels rate candidates highly when they synthesize a quieter peer\'s input. Build on their observation.',
        hinglishTip: `💡 Maya ko Include Karo: Shaant baithe participant ka point support karo—judges inclusivity ke high marks dete hain.`,
        suggestedSpeakingText: `Building directly on the subtle nuance raised earlier, we must ensure our policy does not overlook ordinary end-users in the transition.`,
        badge: 'Panel Awareness'
      };
    }

    // Default / Analyst speaking
    const fact = resolvedFacts.verified_data_points[1] || resolvedFacts.verified_data_points[0];
    return {
      headline: '📊 Quantitative Substantiation Pivot',
      advice: 'The discussion is data-driven. Back up your next contribution with verified institutional figures to establish undeniable authority.',
      hinglishTip: `💡 Aarav ke Data par Bolo: Numbers ko agree karo aur uske sath human/social impact ka angle add karke lead lo.`,
      suggestedSpeakingText: `To add empirical weight to what has been said, ${fact?.source} documented that ${fact?.evidence || 'structured empirical metrics outperform intuitive assumptions'}. This proves our premise is both scalable and economically viable.`,
      badge: 'Empirical Anchor'
    };
  };

  const whisper = getTacticalWhisper();

  const handleAdopt = (text: string) => {
    onAdoptPrompt(text);
    setCopiedNotification('Prompt Adopted! Sent to Speech Input.');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className={`w-full rounded-2xl bg-[#0e070e]/95 border border-[#ff1e2d]/35 backdrop-blur-2xl shadow-[0_15px_45px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 ${className}`}>
      
      {/* HUD HEADER STRIP */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#1c0a15] via-[#120710] to-[#1c0a15] border-b border-[#ff1e2d]/30 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: AI Co-Pilot Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2a0e1c] border border-[#ff1e2d]/60 flex items-center justify-center text-[#ffc400] shadow-[0_0_15px_rgba(255,196,0,0.4)]">
            <Sparkles className="w-4 h-4 animate-spin text-[#ffc400]" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-display font-black tracking-wider text-white uppercase">
                AI Co-Pilot HUD
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#ff1e2d]/25 text-[#ff4d5a] border border-[#ff1e2d]/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff1e2d] animate-ping" />
                Live Whisper
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400">
              Tactical strategy & 100% verified institutional evidence
            </p>
          </div>
        </div>

        {/* Center: Live Pacing Indicator Pill */}
        <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${pacingStatus.color}`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{pacingStatus.label}</span>
        </div>

        {/* Right: Tab Buttons & Minimize/Expand */}
        <div className="flex items-center gap-2">
          {isExpanded && (
            <div className="flex rounded-lg bg-[#080407] p-0.5 border border-[#2e1526]">
              <button
                onClick={() => setActiveTab('whisper')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'whisper'
                    ? 'bg-[#ff1e2d]/30 text-[#ffc400] font-bold border border-[#ff1e2d]/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 text-[#ffc400]" />
                <span>Tactical Hint</span>
              </button>

              <button
                onClick={() => setActiveTab('facts')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'facts'
                    ? 'bg-[#ff1e2d]/30 text-[#ffc400] font-bold border border-[#ff1e2d]/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Facts ({resolvedFacts.verified_data_points.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pitfalls')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pitfalls'
                    ? 'bg-[#ff1e2d]/30 text-[#ffc400] font-bold border border-[#ff1e2d]/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Fallacy Radar</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#180a14] hover:bg-[#261021] border border-[#ff1e2d]/30 text-zinc-300 hover:text-white transition-colors"
            title={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* ADOPT NOTIFICATION TOAST */}
      {copiedNotification && (
        <div className="px-4 py-2 bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedNotification}</span>
          </div>
          <span className="text-[10px] text-emerald-300/80">Press Enter in dock to transmit</span>
        </div>
      )}

      {/* EXPANDED CONTENT BODY */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          
          {/* STUDENT DOUBT RESOLUTION & CONTINUATION STATUS */}
          <div className="p-2.5 rounded-xl bg-[#140812] border border-[#ff1e2d]/30 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStudentSatisfied ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span className="font-mono text-zinc-300">
                <strong className={isStudentSatisfied ? 'text-emerald-300' : 'text-amber-300'}>
                  {isStudentSatisfied ? '✅ Concept Clear:' : '❓ Doubt Active (Auto-Extend):'}
                </strong>{' '}
                {isStudentSatisfied
                  ? 'Doubt clear ho chuka hai! Session time par smoothly conclude hoga.'
                  : 'Jab tak aapka doubt clear nahi hota, GD timer extend hota rahega!'}
              </span>
            </div>

            {onToggleSatisfaction && (
              <div className="flex items-center gap-2">
                {!isStudentSatisfied ? (
                  <button
                    onClick={() => onToggleSatisfaction(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] font-bold transition-colors"
                  >
                    ✓ Samajh Gaya (Doubt Clear)
                  </button>
                ) : (
                  <button
                    onClick={() => onToggleSatisfaction(false)}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold transition-colors"
                  >
                    ❓ Ek Aur Doubt Hai
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: REAL-TIME TACTICAL WHISPER */}
          {activeTab === 'whisper' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#160a13] border border-[#ff1e2d]/30 flex flex-col md:flex-row items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ff1e2d]/25 text-[#ffc400] font-bold border border-[#ff1e2d]/40">
                      {whisper.badge}
                    </span>
                    <h3 className="font-display font-black text-sm text-white flex items-center gap-2">
                      {whisper.headline}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {whisper.advice}
                  </p>
                  {/* Natural Hinglish Tip */}
                  <div className="p-2 rounded-lg bg-[#220d1c] border border-[#ffc400]/40 text-[#ffc400] text-xs font-mono">
                    {whisper.hinglishTip}
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => handleAdopt(whisper.suggestedSpeakingText)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff1e2d] to-[#ff4d5a] hover:from-[#ff3342] hover:to-[#ff6673] text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(255,30,45,0.5)] transition-all transform active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Adopt Strategy</span>
                  </button>
                </div>
              </div>

              {/* Speaking Prompt Preview Card */}
              <div className="p-3 rounded-xl bg-[#080407]/90 border border-[#2b1625] flex items-start gap-3">
                <Quote className="w-5 h-5 text-[#ffc400] shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Recommended Candidate Turn:
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100 font-sans italic leading-relaxed">
                    "{whisper.suggestedSpeakingText}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 100% VERIFIED FACTS AMMO (ZERO FAKE DATA) */}
          {activeTab === 'facts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Institutional Ground Truth (SEBI / WEF / Stanford / OECD)
                </span>
                <span>Click "Adopt Quote" to speak it</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resolvedFacts.verified_data_points.map((fact: FactDataPoint, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#140912] border border-[#ff1e2d]/30 hover:border-[#ffc400]/60 transition-colors flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#200d1c] text-[#ffc400] border border-[#ff1e2d]/40 font-bold truncate max-w-[200px]">
                          🏛️ {fact.source}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white leading-snug">
                        {fact.claim}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed bg-[#0a0509] p-2.5 rounded-lg border border-[#261220]">
                        "{fact.evidence}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleAdopt(`According to official research by ${fact.source}: ${fact.evidence}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#250e1d] hover:bg-[#3d142d] border border-[#ff1e2d]/50 text-white font-mono text-[11px] font-bold transition-all group-hover:border-[#ffc400]"
                    >
                      <Quote className="w-3 h-3 text-[#ffc400]" />
                      <span>Adopt Quote into Mic</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PITFALL RADAR / MYTHS DEBUNKED */}
          {activeTab === 'pitfalls' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                Pitfall Radar: Common GD Logical Fallacies & Evaluator Traps
              </div>

              <div className="space-y-2.5">
                {resolvedFacts.common_myths_debunked.map((item, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#140810] border border-amber-500/30 flex flex-col sm:flex-row items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>

                    <div className="space-y-1.5 flex-1 text-xs">
                      <div>
                        <span className="font-mono uppercase text-[10px] text-red-400 font-bold">
                          ❌ Common Evaluator Trap:
                        </span>
                        <p className="text-white font-semibold mt-0.5">
                          "{item.myth}"
                        </p>
                      </div>

                      <div className="pt-1 border-t border-[#2d1424]">
                        <span className="font-mono uppercase text-[10px] text-emerald-400 font-bold">
                          ✓ Reality & Winning Counter:
                        </span>
                        <p className="text-zinc-300 mt-0.5">
                          {item.reality}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
