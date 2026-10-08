import React, { useState, useEffect } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { Mic, MicOff, Zap, Keyboard, Send, StopCircle } from 'lucide-react';
import { Button } from '../common/Button';

export function PushToTalkDock({ onEndClick }) {
  const {
    isStudentSpeaking,
    sttInterimText,
    startStudentSpeech,
    stopStudentSpeech,
    submitTypedTurn,
    interruptCurrentSpeaker,
    activeSpeakerId,
    participants,
  } = useDiscussion();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [typedDrawerOpen, setTypedDrawerOpen] = useState(false);
  const [typedText, setTypedText] = useState('');

  // Spacebar Push-to-Talk shortcut
  useEffect(() => {
    let isPressed = false;

    function handleKeyDown(e) {
      if (e.code === 'Space' && !e.repeat) {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;

        e.preventDefault();
        isPressed = true;
        handleStartSpeech();
      }
    }

    function handleKeyUp(e) {
      if (e.code === 'Space' && isPressed) {
        isPressed = false;
        e.preventDefault();
        handleStopSpeech();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeSpeakerId]);

  function handleStartSpeech() {
    if (isMuted) return;
    startStudentSpeech();
  }

  function handleStopSpeech() {
    setIsProcessing(true);
    stopStudentSpeech();
    setTimeout(() => setIsProcessing(false), 800);
  }

  function handleInterrupt() {
    interruptCurrentSpeaker();
  }

  function handleSendTyped(e) {
    e.preventDefault();
    if (!typedText.trim()) return;
    submitTypedTurn(typedText.trim());
    setTypedText('');
    setTypedDrawerOpen(false);
  }

  const isAiSpeaking = activeSpeakerId && activeSpeakerId !== 'you';
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId);

  // Button state determining label & styling
  let buttonLabel = 'HOLD TO SPEAK';
  let buttonSubtext = 'Press Spacebar or Hold Button';
  if (isStudentSpeaking) {
    buttonLabel = 'LISTENING…';
    buttonSubtext = 'Speak clearly into microphone';
  } else if (isProcessing) {
    buttonLabel = 'PROCESSING…';
    buttonSubtext = 'Analyzing speech pattern';
  } else if (!isAiSpeaking && !isStudentSpeaking) {
    buttonLabel = 'HOLD TO SPEAK';
    buttonSubtext = 'Floor is open to speak';
  }

  return (
    <footer className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-3 select-none">
      {/* Real-time Interim STT Speech Preview Bubble */}
      {isStudentSpeaking && (
        <div className="absolute -top-16 px-4 py-2 rounded-xl bg-arena-surface/95 border border-sky-400/40 shadow-xl backdrop-blur-md text-xs text-sky-200 animate-in fade-in slide-in-from-bottom-2 max-w-lg truncate flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping flex-shrink-0" />
          <span className="font-mono text-slate-400 text-[10px]">YOU:</span>
          <span>{sttInterimText || 'Listening to your argument...'}</span>
        </div>
      )}

      {/* Main Push-to-Talk Control Cluster */}
      <div className="flex items-center gap-3 sm:gap-4 w-full justify-center">
        {/* Secondary: Mute */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`h-11 px-3.5 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
            isMuted
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-arena-surface/80 border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title={isMuted ? 'Microphone is Muted' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        {/* PRIMARY PUSH-TO-TALK BUTTON */}
        <button
          type="button"
          onMouseDown={handleStartSpeech}
          onMouseUp={handleStopSpeech}
          onTouchStart={handleStartSpeech}
          onTouchEnd={handleStopSpeech}
          disabled={isMuted}
          className={`relative group flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 rounded-xl border transition-all duration-200 ${
            isStudentSpeaking
              ? 'bg-gradient-to-r from-sky-950/80 to-blue-900/70 border-sky-400 text-white shadow-[0_0_30px_rgba(56,189,248,0.35)] scale-102'
              : isProcessing
              ? 'bg-violet-950/60 border-violet-500/50 text-violet-200'
              : 'bg-gradient-to-b from-[#191424] to-[#0c0d12] border-pink-500/40 hover:border-pink-500/70 text-white shadow-[0_0_20px_rgba(244,63,94,0.18)] hover:-translate-y-0.5 active:scale-98'
          }`}
        >
          {/* Radial listening ring animation */}
          {isStudentSpeaking && (
            <span className="absolute -inset-1 rounded-xl border border-sky-400/50 animate-ping opacity-40 pointer-events-none" />
          )}

          {/* Microphone Icon */}
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isStudentSpeaking
                ? 'bg-sky-400 text-slate-950'
                : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
            }`}
          >
            <Mic size={16} className={isStudentSpeaking ? 'animate-pulse' : ''} />
          </div>

          <div className="text-left">
            <span className="font-heading font-bold text-sm tracking-wide block leading-tight">
              {buttonLabel}
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight font-mono">
              {buttonSubtext}
            </span>
          </div>
        </button>

        {/* Secondary: Interrupt Action (Highlight when AI is speaking) */}
        <button
          type="button"
          onClick={handleInterrupt}
          disabled={!isAiSpeaking}
          className={`h-11 px-3.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 ${
            isAiSpeaking
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-arena-surface/40 border-white/5 text-slate-400 cursor-not-allowed'
          }`}
          title={isAiSpeaking ? `Interrupt ${activeSpeaker?.name || 'AI'}` : 'Nobody to interrupt'}
        >
          <Zap size={15} className={isAiSpeaking ? 'text-amber-400 animate-pulse' : ''} />
          <span>Interrupt</span>
        </button>

        {/* Text fallback toggle */}
        <button
          type="button"
          onClick={() => setTypedDrawerOpen(!typedDrawerOpen)}
          className="h-11 px-3 rounded-lg border border-white/10 bg-arena-surface/60 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Type your response"
        >
          <Keyboard size={15} />
        </button>

        {/* End GD secondary */}
        <Button
          variant="danger"
          size="compact"
          onClick={onEndClick}
          className="!h-11 !px-3.5 !text-xs"
        >
          End GD
        </Button>
      </div>

      {/* Typed Input Expandable Drawer (Fallback / Accessibility) */}
      {typedDrawerOpen && (
        <form
          onSubmit={handleSendTyped}
          className="w-full flex items-center gap-2 p-2 rounded-xl bg-arena-surface border border-white/10 animate-in fade-in"
        >
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your argument and press Enter to participate..."
            className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50"
            autoFocus
          />
          <Button variant="primary" size="compact" type="submit" icon={Send} iconPosition="right">
            Send
          </Button>
        </form>
      )}
    </footer>
  );
}
