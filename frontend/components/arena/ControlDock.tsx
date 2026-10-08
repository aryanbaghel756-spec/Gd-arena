'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Subtitles, 
  Pause, 
  Play, 
  FastForward, 
  XOctagon, 
  AlertTriangle, 
  RefreshCw, 
  Keyboard, 
  Send,
  Volume2
} from 'lucide-react';
import { HexButton } from '../ui/HexButton';
import { RectButton } from '../ui/RectButton';

interface ControlDockProps {
  isHoldingSpeak: boolean;
  onHoldSpeakStart: () => void;
  onHoldSpeakEnd: () => void;
  isMicOn: boolean;
  onToggleMic: () => void;
  onInterrupt: () => void;
  showCaptions: boolean;
  onToggleCaptions: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onSkipToClosing: () => void;
  onEndGD: () => void;
  // Error Banner State
  micError: string | null;
  onRetryMic: () => void;
  onSubmitTypedSpeech?: (text: string) => void;
  adoptedText?: string | null;
  onAdoptedTextHandled?: () => void;
}

export function ControlDock({
  isHoldingSpeak,
  onHoldSpeakStart,
  onHoldSpeakEnd,
  isMicOn,
  onToggleMic,
  onInterrupt,
  showCaptions,
  onToggleCaptions,
  isPaused,
  onTogglePause,
  onSkipToClosing,
  onEndGD,
  micError,
  onRetryMic,
  onSubmitTypedSpeech,
  adoptedText,
  onAdoptedTextHandled,
}: ControlDockProps) {
  const [isTypeInsteadOpen, setIsTypeInsteadOpen] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');

  // Auto-fill and open drawer when a prompt is adopted from Co-Pilot HUD
  useEffect(() => {
    if (adoptedText && adoptedText.trim()) {
      setTypedMessage(adoptedText.trim());
      setIsTypeInsteadOpen(true);
      if (onAdoptedTextHandled) onAdoptedTextHandled();
    }
  }, [adoptedText, onAdoptedTextHandled]);

  // Keyboard shortcut listener: Space for push-to-talk, M for toggle, I for interrupt
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' && !e.repeat && !isHoldingSpeak) {
        e.preventDefault();
        onHoldSpeakStart();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onToggleMic();
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        onInterrupt();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        onToggleCaptions();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onHoldSpeakEnd();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isHoldingSpeak, onHoldSpeakStart, onHoldSpeakEnd, onToggleMic, onInterrupt, onToggleCaptions]);

  const handleSendTypeMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    if (onSubmitTypedSpeech) {
      onSubmitTypedSpeech(typedMessage.trim());
    }
    setTypedMessage('');
    setIsTypeInsteadOpen(false);
  };

  return (
    <div className="w-full space-y-3">
      
      {/* Gentle Error Banner (if mic is denied or connection drops) */}
      {micError && (
        <div className="p-3.5 rounded-xl bg-[#260a10]/95 border border-[#ff1e2d] shadow-[0_0_20px_rgba(255,30,45,0.4)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-100">
            <AlertTriangle className="w-4 h-4 text-[#ff1e2d] shrink-0 animate-bounce" />
            <span>
              <strong className="text-white">Audio Alert:</strong> {micError}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRetryMic}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3d0f19] hover:bg-[#521422] border border-[#ff1e2d]/60 text-white font-mono transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => setIsTypeInsteadOpen(!isTypeInsteadOpen)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e131b] hover:bg-[#2e1d2a] border border-[#ffc400]/50 text-[#ffc400] font-mono transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type instead</span>
            </button>
          </div>
        </div>
      )}

      {/* Type-Instead Drawer Form */}
      {isTypeInsteadOpen && (
        <form onSubmit={handleSendTypeMessage} className="p-3.5 rounded-xl bg-[#140b12] border border-[#ffc400]/60 flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Type your discussion response to simulate voice speech..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#0a0509] border border-[#ff1e2d]/40 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#ffc400]"
            autoFocus
          />
          <RectButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={!typedMessage.trim()}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Speak Turn
          </RectButton>
        </form>
      )}

      {/* Main Control Dock Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c070c]/90 border border-[#ff1e2d]/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Auxiliary Buttons */}
        <div className="flex items-center gap-2">
          {/* Mic On/Off */}
          <RectButton
            variant={isMicOn ? 'primary' : 'secondary'}
            size="md"
            onClick={onToggleMic}
            icon={isMicOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-red-400" />}
            aria-label="Toggle Microphone"
            title="Toggle Continuous Mic (M)"
          >
            <span className="hidden sm:inline">{isMicOn ? 'Mic Live' : 'Mic Off'}</span>
          </RectButton>

          {/* Interrupt */}
          <RectButton
            variant="secondary"
            size="md"
            onClick={onInterrupt}
            icon={<Hand className="w-4 h-4 text-[#ffc400]" />}
            aria-label="Polite Interrupt"
            title="Intervene / Request Floor (I)"
          >
            <span className="hidden sm:inline">Interrupt</span>
          </RectButton>

          {/* Captions */}
          <RectButton
            variant="ghost"
            size="md"
            onClick={onToggleCaptions}
            icon={<Subtitles className="w-4 h-4 text-amber-300" />}
            aria-label="Toggle Captions"
            title="Toggle Live Subtitles (C)"
          >
            <span className="hidden md:inline">{showCaptions ? 'Captions' : 'Captions'}</span>
          </RectButton>
        </div>

        {/* Center: BIG HOLD TO SPEAK HEX BUTTON */}
        <div className="flex-1 sm:flex-initial flex justify-center order-first sm:order-none w-full sm:w-auto">
          <HexButton
            variant="primary"
            size="xl"
            onMouseDown={onHoldSpeakStart}
            onMouseUp={onHoldSpeakEnd}
            onTouchStart={onHoldSpeakStart}
            onTouchEnd={onHoldSpeakEnd}
            icon={<Mic className={`w-6 h-6 ${isHoldingSpeak ? 'animate-bounce text-white' : 'text-amber-100'}`} />}
            className={`
              w-full sm:w-64 transition-all duration-200
              ${isHoldingSpeak 
                ? 'scale-105 shadow-[0_0_40px_rgba(255,196,0,0.9)] ring-2 ring-[#ffc400]' 
                : 'shadow-[0_0_25px_rgba(255,30,45,0.6)]'
              }
            `}
            aria-label="Hold to Speak"
          >
            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg font-black tracking-widest">
                {isHoldingSpeak ? 'TRANSMITTING...' : 'HOLD TO SPEAK'}
              </span>
              <span className="text-[10px] font-mono tracking-normal text-amber-200 opacity-80">
                {isHoldingSpeak ? 'Release when done' : 'Click & hold or Spacebar'}
              </span>
            </div>
          </HexButton>
        </div>

        {/* Right Auxiliary Buttons: Pause, Skip, End */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <RectButton
            variant="secondary"
            size="md"
            onClick={onTogglePause}
            icon={isPaused ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-amber-300" />}
            aria-label="Pause or Resume"
            title="Pause Arena Clock"
          >
            <span className="hidden md:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </RectButton>

          {/* Skip to Closing Round */}
          <RectButton
            variant="ghost"
            size="md"
            onClick={onSkipToClosing}
            icon={<FastForward className="w-4 h-4 text-[#ffc400]" />}
            aria-label="Skip to Closing Round"
            title="Fast forward to final wrap-up"
          >
            <span className="hidden lg:inline">Closing Round</span>
          </RectButton>

          {/* End GD (Danger) */}
          <HexButton
            variant="danger"
            size="md"
            onClick={onEndGD}
            icon={<XOctagon className="w-4 h-4" />}
            aria-label="End Group Discussion"
          >
            End GD
          </HexButton>
        </div>

      </div>

      {/* Mic Status & Permissions Indicator Strip */}
      <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isMicOn || isHoldingSpeak ? 'bg-[#ffc400] animate-ping' : 'bg-green-500'}`} />
          <span>
            {isHoldingSpeak ? 'User Speech Channel Live (Transmitting)' : isMicOn ? 'Continuous Mic Active' : 'Push-to-Talk Armed & Ready'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => onRetryMic()} 
            className="hover:text-amber-300 transition-colors"
          >
            Simulate Mic Error
          </button>
          <span>Latency: 42ms</span>
        </div>
      </div>

    </div>
  );
}
