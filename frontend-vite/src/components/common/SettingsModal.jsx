import React, { useState } from 'react';
import { X, Volume2, Mic, Sliders, Shield, Zap, Sparkles } from 'lucide-react';
import { Button } from './Button';

export function SettingsModal({ isOpen, onClose }) {
  const [speechRate, setSpeechRate] = useState(1.0);
  const [micSensitivity, setMicSensitivity] = useState(80);
  const [autoInterrupt, setAutoInterrupt] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-md p-6 bg-arena-surface/95 border border-white/10 rounded-xl shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Arena Settings</h3>
              <p className="text-xs text-slate-400">Audio, persona synthesis, and simulation rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5 text-sm">
          {/* Persona Voice Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 size={14} className="text-pink-400" />
                AI Voice Speed ({speechRate.toFixed(2)}x)
              </label>
              <span className="text-xs font-mono text-slate-400">{speechRate === 1.0 ? 'Normal' : speechRate > 1.0 ? 'Fast' : 'Relaxed'}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Microphone Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mic size={14} className="text-violet-400" />
                Microphone Sensitivity ({micSensitivity}%)
              </label>
              <span className="text-xs font-mono text-emerald-400">Calibrated</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={micSensitivity}
              onChange={(e) => setMicSensitivity(parseInt(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Toggle 1: Instant Interruption */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="font-medium text-slate-200">Instant Student Interruption</div>
              <div className="text-xs text-slate-400">Allow interrupting AI speakers without waiting for turn completion</div>
            </div>
            <button
              onClick={() => setAutoInterrupt(!autoInterrupt)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${autoInterrupt ? 'bg-pink-600' : 'bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoInterrupt ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Toggle 2: Audio chime feedback */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="font-medium text-slate-200">Subtle Arena Audio Cues</div>
              <div className="text-xs text-slate-400">Play soft chime on turn switches and moderator interventions</div>
            </div>
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${audioFeedback ? 'bg-pink-600' : 'bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${audioFeedback ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} size="compact">
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose} size="compact">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
