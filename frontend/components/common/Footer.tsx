'use client';

import React from 'react';
import { ShieldCheck, Command, Keyboard, Mic, Sparkles, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#261820] bg-[#07070a]/95 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#21141a]">
          
          {/* Col 1: Brand & Transparency */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-wider">
                GD ARENA
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#ff1e2d]/20 text-[#ff4d5a] border border-[#ff1e2d]/30">
                AI Voice Lab
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Practise high-stakes group discussions with dynamic, voice-driven AI personas and an autonomous moderator. Get unfiltered, objective rubric feedback on every turn.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber-200/80">
              <ShieldCheck className="w-4 h-4 text-[#ffc400]" />
              <span>Full AI disclosure: Every persona except the active user is synthetically simulated.</span>
            </div>
          </div>

          {/* Col 2: Keyboard Hotkeys */}
          <div>
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-amber-300 mb-3 flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-[#ffc400]" />
              Arena Hotkeys
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-center justify-between text-zinc-300">
                <span>Hold to Speak</span>
                <kbd className="px-2 py-0.5 bg-[#170e14] border border-[#ff1e2d]/40 rounded text-amber-300">Space</kbd>
              </li>
              <li className="flex items-center justify-between text-zinc-300">
                <span>Toggle Mic</span>
                <kbd className="px-2 py-0.5 bg-[#170e14] border border-[#ff1e2d]/40 rounded text-amber-300">M</kbd>
              </li>
              <li className="flex items-center justify-between text-zinc-300">
                <span>Polite Interrupt</span>
                <kbd className="px-2 py-0.5 bg-[#170e14] border border-[#ff1e2d]/40 rounded text-amber-300">I</kbd>
              </li>
              <li className="flex items-center justify-between text-zinc-300">
                <span>Toggle Captions</span>
                <kbd className="px-2 py-0.5 bg-[#170e14] border border-[#ff1e2d]/40 rounded text-amber-300">C</kbd>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Privacy */}
          <div>
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-amber-300 mb-3 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#ff1e2d]" />
              Tech & Evaluation
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Built with Next.js App Router, Tailwind CSS & Framer Motion. 6-dimension evaluation rubric aligned with top B-school & executive hiring standards.
            </p>
            <div className="text-[11px] font-mono text-zinc-500">
              Low-latency WebRTC Ready • 60 FPS Canvas Lattice
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © {new Date().getFullYear()} GD Arena. Production-Quality Training Platform.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#ffc400] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ffc400] animate-ping" />
              Engine Ready
            </span>
            <span>AA Contrast Standards</span>
            <span>Reduced Motion Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
