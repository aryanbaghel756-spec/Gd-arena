'use client';

import React, { useState, useEffect } from 'react';
import { GDReport, TranscriptItem, PastSessionRecord } from '@/types/arena';
import { MOCK_PAST_SESSIONS } from '@/data/mockData';
import { 
  Award, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Copy, 
  RotateCcw, 
  Share2, 
  Quote, 
  Sparkles, 
  TrendingUp,
  AlertCircle,
  Target,
  MessageSquare,
  History
} from 'lucide-react';
import { HexButton } from '../ui/HexButton';
import { RectButton } from '../ui/RectButton';

interface ReportViewProps {
  report: GDReport;
  transcripts: TranscriptItem[];
  topicTitle: string;
  onPractiseAgain: () => void;
}

export function ReportView({
  report,
  transcripts,
  topicTitle,
  onPractiseAgain,
}: ReportViewProps) {
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(report.skills[0]?.id || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSessionRecord[]>(MOCK_PAST_SESSIONS);

  useEffect(() => {
    fetch('/api/students/student_default/reports')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.reports && data.reports.length > 0) {
          const mapped: PastSessionRecord[] = data.reports.slice(0, 5).reverse().map((r: any, idx: number) => {
            const crits = r.criteria_scores || [];
            const getCritScore = (term: string) => {
              const found = crits.find((c: any) => c.criterion?.toLowerCase().includes(term));
              return found ? Math.round(found.score * 20) : 70;
            };
            return {
              sessionId: r.room_id || `sess-${idx + 1}`,
              sessionNumber: idx + 1,
              topic: r.topic,
              overallScore: r.overall_score || 75,
              speakingScore: getCritScore('start') || 78,
              listeningScore: getCritScore('listen') || 68,
              ideasScore: getCritScore('idea') || 80,
              date: new Date(r.created_at_ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          if (mapped.length >= 2) {
            setPastSessions(mapped);
          }
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyTranscript = () => {
    const text = transcripts
      .map((t) => `[${t.timestamp}] ${t.speakerName} (${t.personality}): ${t.text}`)
      .join('\n\n');
    navigator.clipboard?.writeText(text);
    showToast('Transcript copied to clipboard!');
  };

  const handleDownloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GD_Arena_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Evaluation report JSON downloaded!');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Session link copied to clipboard!');
  };

  // Circular gauge parameters
  const score = report.overallScore;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-xl bg-[#220c1a] border border-[#ffc400] text-amber-200 shadow-[0_0_20px_rgba(255,196,0,0.4)] text-xs font-mono flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#ffc400]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rounded-2xl bg-[#0e080e]/90 border border-[#ff1e2d]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-[#281523]">
          
          {/* Left: Overall Score Circular Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#21121d"
                  strokeWidth="12"
                />
                {/* Score Progress Ring with Neon Glow */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="url(#scoreGrad)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff1e2d" />
                    <stop offset="100%" stopColor="#ffc400" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner Score Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display font-black text-4xl text-white tracking-tight drop-shadow-md">
                  {report.overallScore}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  OUT OF 100
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#ffc400]/20 text-[#ffc400] text-xs font-mono font-bold border border-[#ffc400]/40">
                <Award className="w-3.5 h-3.5" />
                <span>TOP {100 - report.percentile}% PERCENTILE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white uppercase tracking-tight">
                {report.performanceBadge}
              </h2>
              <p className="text-xs text-zinc-400 max-w-md font-mono">
                Topic: <strong className="text-amber-100">{topicTitle}</strong>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <HexButton
              variant="primary"
              size="md"
              onClick={onPractiseAgain}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Practise Again
            </HexButton>

            <RectButton
              variant="secondary"
              size="md"
              onClick={handleDownloadReport}
              icon={<Download className="w-4 h-4" />}
            >
              Download Report
            </RectButton>

            <RectButton
              variant="ghost"
              size="md"
              onClick={handleCopyTranscript}
              icon={<Copy className="w-4 h-4" />}
            >
              Copy Transcript
            </RectButton>

            <RectButton
              variant="ghost"
              size="md"
              onClick={handleShare}
              icon={<Share2 className="w-4 h-4" />}
            >
              Share
            </RectButton>
          </div>

        </div>

        {/* Executive Feedback Summary */}
        <div className="pt-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ff1e2d]" />
            EXECUTIVE AUDIT SUMMARY
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
            {report.summary}
          </p>
        </div>

      </div>

      {/* Speaking-Time Share Bar Section */}
      <div className="rounded-2xl bg-[#0e080e]/90 border border-[#ff1e2d]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#ffc400]" />
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Speaking-Time Distribution
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Total Session Duration: {Math.floor(report.durationSeconds / 60)}m {report.durationSeconds % 60}s
          </span>
        </div>

        {/* Proportional Segmented Bar */}
        <div className="w-full h-6 rounded-lg bg-[#180d16] overflow-hidden flex p-1 gap-1 border border-[#30192a]">
          {report.participationShare.map((share) => (
            <div
              key={share.participantId}
              style={{
                width: `${share.percentage}%`,
                backgroundColor: share.color,
              }}
              className="h-full rounded-sm transition-all hover:opacity-90 relative group cursor-pointer"
              title={`${share.name}: ${share.percentage}% (${share.seconds}s)`}
            />
          ))}
        </div>

        {/* Share Bar Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {report.participationShare.map((share) => (
            <div
              key={share.participantId}
              className={`p-2.5 rounded-lg border text-xs ${
                share.isUser
                  ? 'bg-[#291322] border-[#ffc400] text-amber-100 shadow-[0_0_10px_rgba(255,196,0,0.2)]'
                  : 'bg-[#120a10] border-[#291724] text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: share.color }}
                />
                <span className="font-display font-bold truncate text-white">
                  {share.name}
                </span>
              </div>
              <div className="font-mono text-[11px] flex justify-between">
                <span>{share.percentage}%</span>
                <span>{share.seconds}s</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 1. Personalized Improvement Plan (Section 11) */}
      <div className="rounded-2xl bg-[#0e080e]/95 border border-[#ffc400]/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_40px_rgba(255,196,0,0.1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2d1825]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ffc400]/20 border border-[#ffc400]/40 text-[#ffc400]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                Personalized Improvement Plan
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Agli placement GD ke liye personalized roadmap aur specific targets
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold uppercase">
            Actionable Next Steps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Biggest Improvement Area */}
          <div className="p-4 rounded-xl bg-[#160c14] border border-[#ff1e2d]/40 space-y-2">
            <span className="text-[10px] font-mono text-[#ff4d5a] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Sabse Bada Focus Area
            </span>
            <h4 className="font-display font-bold text-sm text-white">
              {report.improvementPlan?.biggestImprovementArea || "Active Listening & Collaborative Building"}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Yahan aapka score sabse quickly improve hoga. Previous speaker ke argument ko pehle acknowledge karein, phir factual pivot karein.
            </p>
          </div>

          {/* 2. Next GD Goals */}
          <div className="p-4 rounded-xl bg-[#160c14] border border-[#ffc400]/30 space-y-2">
            <span className="text-[10px] font-mono text-amber-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffc400]" />
              Next GD Goals
            </span>
            <ul className="space-y-1.5 text-xs text-zinc-300 list-disc list-inside">
              {(report.improvementPlan?.nextGDGoals || [
                "Dusre candidate ke point ko 2 baar acknowledge karein.",
                "Interrupt karte waqt courteous bridge phrasing use karein.",
                "Apne counter-argument ko institutional data se back karein."
              ]).map((goal, idx) => (
                <li key={idx} className="leading-snug">{goal}</li>
              ))}
            </ul>
          </div>

          {/* 3. Practice Challenge */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#20101b] to-[#120810] border border-emerald-500/40 space-y-2">
            <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Practice Challenge
            </span>
            <p className="text-xs text-emerald-100 font-mono bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/30 italic">
              "{report.improvementPlan?.practiceChallenge || 'Build on another speaker\'s argument 2 times during your next GD.'}"
            </p>
            <span className="text-[10px] text-zinc-400 font-mono block">
              Is challenge ko follow karne se active listening score boost hoga.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Evidence-Based Feedback: "What You Could Have Said" (Section 10) */}
      <div className="rounded-2xl bg-[#0e080e]/95 border border-[#ff1e2d]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2d1825]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ff1e2d]/20 border border-[#ff1e2d]/40 text-[#ff4d5a]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <span>Evidence-Based Feedback</span>
                <span className="text-xs text-amber-300 font-mono normal-case">(What You Could Have Said)</span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Actual transcript evidence: Aapne kya bola vs interview shortlist hone ke liye kya bolna tha
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold uppercase">
            Transcript Replay Analysis
          </span>
        </div>

        <div className="space-y-4">
          {(report.missedOpportunities || []).map((opp, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#140a12] border border-[#2b1725] hover:border-[#ff1e2d]/40 transition-all space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ffc400]" />
                  Turn #{idx + 1}: Triggered by {opp.speakerName}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/60 text-zinc-400 border border-zinc-700/50">
                  Missed Strategy: {opp.missedAngle}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: What happened */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#0b060a] border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-1">
                      Peer Trigger ({opp.speakerName} ne kaha):
                    </span>
                    <p className="text-xs text-zinc-200 italic">
                      "{opp.triggerText}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#180a13] border border-rose-900/40">
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-1">
                      Your Response (Aapka reply):
                    </span>
                    <p className="text-xs text-zinc-300">
                      "{opp.studentResponse || 'Aapne is trigger point par silent reh kar floor chhod diya.'}"
                    </p>
                  </div>

                  {opp.aiFeedback && (
                    <div className="text-xs text-amber-200/90 font-mono bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                      <strong>AI Evaluator Note:</strong> {opp.aiFeedback}
                    </div>
                  )}
                </div>

                {/* Right: What You Could Have Said */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex-1">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold block mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      What You Could Have Said (Topper Strategy):
                    </span>
                    <p className="text-xs text-emerald-100 font-mono leading-relaxed bg-black/40 p-2.5 rounded border border-emerald-500/20 italic">
                      "{opp.suggestedResponse}"
                    </p>
                  </div>

                  {opp.howToImprove && (
                    <div className="p-3 rounded-lg bg-[#1b1016] border border-[#ffc400]/40 text-xs text-zinc-300">
                      <strong className="text-[#ffc400] font-mono text-[11px] block mb-0.5">Kaise Improve Karein:</strong>
                      {opp.howToImprove}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 6 Skill Cards Section (Formatted /100) */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#ff1e2d]" />
            <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
              6-Dimensional Evaluation Rubric
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Click any card to inspect quoted moment in transcript
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.skills.map((skill) => {
            const isExpanded = expandedSkillId === skill.id;
            const displayScore = skill.score > 10 ? skill.score : Math.round(skill.score * 10);

            return (
              <div
                key={skill.id}
                className={`
                  p-5 rounded-xl border transition-all duration-200
                  ${isExpanded
                    ? 'bg-[#1a0c17] border-[#ffc400] shadow-[0_0_20px_rgba(255,196,0,0.25)]'
                    : 'bg-[#0f090e]/90 border-[#2b1725] hover:border-[#ff1e2d]/50 hover:bg-[#140b12]'
                  }
                `}
              >
                {/* Header: Title + Score + Expand Button */}
                <div
                  onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-white">
                        {skill.title}
                      </span>
                      <span
                        className={`
                          text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border
                          ${skill.status === 'strength'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : skill.status === 'needs-work'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }
                        `}
                      >
                        {skill.badgeText}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                      {skill.feedback}
                    </p>
                  </div>

                  {/* Score pill formatted out of 100 */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-display font-black text-2xl text-white">
                      {displayScore}
                      <span className="text-xs text-zinc-500 font-mono">/100</span>
                    </span>
                    <button className="text-zinc-400 hover:text-[#ffc400] mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Quoted Transcript Moment */}
                {isExpanded && (
                  <div className="mt-4 pt-3.5 border-t border-[#35192d] space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-[#ff1e2d]" />
                        <span>QUOTED TRANSCRIPT MOMENT</span>
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>Timestamp: {skill.quotedMoment.timestamp}</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#11070e] border border-[#ff1e2d]/30 text-xs text-zinc-200 italic leading-relaxed">
                      {skill.quotedMoment.quote}
                    </div>

                    <div className="text-[11px] text-zinc-400 font-mono">
                      Context: {skill.quotedMoment.context}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* 4. Progress Tracking (Past Sessions) (Section 12) */}
      <div className="rounded-2xl bg-[#0e080e]/95 border border-[#ff1e2d]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2d1825]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ffc400]/20 border border-[#ffc400]/40 text-[#ffc400]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                Progress Tracking (Past Sessions History)
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Pichle GD sessions ke scores aur performance trajectory
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold uppercase">
            📈 Persistent History
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pastSessions.map((sess) => (
            <div
              key={sess.sessionId}
              className={`p-4 rounded-xl border ${
                sess.sessionNumber === pastSessions.length
                  ? 'bg-[#1e0f1b] border-[#ffc400] shadow-[0_0_20px_rgba(255,196,0,0.15)]'
                  : 'bg-[#120910] border-[#291724]'
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Session {sess.sessionNumber}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {sess.date}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-black text-[#ffc400]">
                  {sess.overallScore}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">/100 Overall</span>
              </div>

              <p className="text-[11px] text-zinc-300 line-clamp-1 font-mono">
                {sess.topic}
              </p>

              <div className="pt-2 border-t border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Speaking:</span>
                  <span className="text-white font-bold">{sess.speakingScore}/100</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Listening:</span>
                  <span className="text-white font-bold">{sess.listeningScore}/100</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Ideas:</span>
                  <span className="text-white font-bold">{sess.ideasScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#261521]">
        <span className="text-xs font-mono text-zinc-400">
          Agla session start karke apna active listening score boost karein:
        </span>

        <HexButton
          variant="primary"
          size="lg"
          onClick={onPractiseAgain}
          icon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Start Another Session
        </HexButton>
      </div>

    </div>
  );
}
