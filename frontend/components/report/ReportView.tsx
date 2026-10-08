'use client';

import React, { useState } from 'react';
import { GDReport, TranscriptItem } from '@/types/arena';
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
  AlertCircle
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

      {/* 6 Skill Cards Section */}
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

                  {/* Score pill */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-display font-black text-2xl text-white">
                      {skill.score}
                      <span className="text-xs text-zinc-500 font-mono">/10</span>
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

      {/* Bottom Actions Bar */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#261521]">
        <span className="text-xs font-mono text-zinc-400">
          Want to improve your handling of interruptions or try a case-based prompt?
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
