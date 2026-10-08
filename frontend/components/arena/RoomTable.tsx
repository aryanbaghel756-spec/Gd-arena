'use client';

import React from 'react';
import { Participant } from '@/types/arena';
import { Mic, MicOff, Shield, Radio, Volume2 } from 'lucide-react';

interface RoomTableProps {
  participants: Participant[];
  activeSpeakerId: string | null;
  isUserSpeaking: boolean;
  userAudioLevel: number;
  currentSpeechSnippet?: string;
}

export function RoomTable({
  participants,
  activeSpeakerId,
  isUserSpeaking,
  userAudioLevel,
  currentSpeechSnippet,
}: RoomTableProps) {
  // Sort participants so Moderator is top, User is bottom, and AI personas are arranged around the hexagonal perimeter
  const moderator = participants.find((p) => p.role === 'moderator');
  const user = participants.find((p) => p.role === 'user');
  const aiList = participants.filter((p) => p.role === 'ai');

  const anyoneSpeaking = Boolean(activeSpeakerId || isUserSpeaking);
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) || (isUserSpeaking ? user : null);

  const getStatus = (p: Participant): 'Speaking' | 'Listening' | 'Waiting' => {
    const isSelfActive = (p.id === activeSpeakerId) || (p.role === 'user' && isUserSpeaking);
    if (isSelfActive) return 'Speaking';
    if (anyoneSpeaking) return 'Listening';
    return 'Waiting';
  };

  return (
    <div className="relative w-full min-h-[460px] sm:min-h-[520px] flex items-center justify-center p-4">
      
      {/* Background Radial Glow & Concentric Hex Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Hex Ring */}
        <div className="w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full border border-[#ff1e2d]/15 animate-[spin_60s_linear_infinite]" />
        {/* Middle Glowing Ring */}
        <div className="absolute w-[260px] sm:w-[380px] h-[260px] sm:h-[380px] rounded-full border border-[#ffc400]/20 shadow-[0_0_40px_rgba(255,30,45,0.12)]" />
        {/* Inner Core Pulse */}
        <div className="absolute w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-gradient-to-br from-[#ff1e2d]/10 via-[#ffc400]/15 to-transparent blur-2xl animate-pulse" />
      </div>

      {/* Center Table Core (Holographic Discussion Node) */}
      <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 flex flex-col items-center justify-center text-center p-4 rounded-full bg-[#0d070c]/90 border border-[#ff1e2d]/40 shadow-[0_0_30px_rgba(255,30,45,0.3)] backdrop-blur-xl">
        <div className="relative w-10 h-10 flex items-center justify-center mb-1">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#ff1e2d] to-[#ffc400] clip-hex-regular animate-spin [animation-duration:15s]" />
          <div className="absolute inset-[2px] bg-[#0c080b] clip-hex-regular flex items-center justify-center">
            <Radio className="w-4 h-4 text-[#ffc400] animate-pulse" />
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
          ROUND TABLE CORE
        </span>

        {/* Central Audio Waveform Bars */}
        <div className="flex items-center gap-1 my-1.5 h-6">
          {[40, 75, 100, 60, 90, 45, 80, 30].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                activeSpeaker ? 'bg-gradient-to-t from-[#ff1e2d] to-[#ffc400]' : 'bg-zinc-700'
              }`}
              style={{
                height: activeSpeaker ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * 50 + 50)}%` : '20%',
              }}
            />
          ))}
        </div>

        <span className="text-[10px] font-mono text-zinc-400">
          {activeSpeaker ? activeSpeaker.name.split(' ')[0] : 'Idle Floor'}
        </span>
      </div>

      {/* Floating Active Speech Caption Pill Above Center */}
      {currentSpeechSnippet && (
        <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 max-w-sm sm:max-w-md w-full px-4 z-30 pointer-events-none">
          <div className="p-3 rounded-xl bg-[#170a13]/95 border border-[#ffc400]/70 shadow-[0_0_25px_rgba(255,196,0,0.35)] backdrop-blur-md flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#ffc400] animate-ping shrink-0" />
            <p className="text-xs text-amber-100 font-mono italic truncate">
              {currentSpeechSnippet}
            </p>
          </div>
        </div>
      )}

      {/* Outer Hexagonal Ring of Participants */}
      <div className="absolute inset-0 max-w-2xl max-h-[500px] m-auto pointer-events-none">
        
        {/* 1. Moderator Node (Top Center) */}
        {moderator && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-auto">
            <ParticipantNode
              participant={moderator}
              isActive={activeSpeakerId === moderator.id}
              status={getStatus(moderator)}
              isUser={false}
            />
          </div>
        )}

        {/* 2. User Node (Bottom Center) */}
        {user && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto">
            <ParticipantNode
              participant={user}
              isActive={isUserSpeaking}
              status={getStatus(user)}
              isUser={true}
              audioLevel={userAudioLevel}
            />
          </div>
        )}

        {/* 3. AI Personas Arranged Left & Right in Hexagonal Formation */}
        {aiList.map((ai, index) => {
          // Dynamic positions for up to 5 AI personas
          const positions = [
            'top-16 sm:top-20 left-2 sm:left-6',          // Top Left
            'top-16 sm:top-20 right-2 sm:right-6',        // Top Right
            'bottom-20 sm:bottom-24 left-2 sm:left-6',   // Bottom Left
            'bottom-20 sm:bottom-24 right-2 sm:right-6', // Bottom Right
            'top-1/2 -translate-y-1/2 left-0 sm:left-2',  // Mid Left (if 5)
          ];
          const posClass = positions[index] || 'top-1/2 left-0';

          return (
            <div key={ai.id} className={`absolute ${posClass} pointer-events-auto`}>
              <ParticipantNode
                participant={ai}
                isActive={activeSpeakerId === ai.id}
                status={getStatus(ai)}
                isUser={false}
              />
            </div>
          );
        })}

      </div>

    </div>
  );
}

interface ParticipantNodeProps {
  participant: Participant;
  isActive: boolean;
  status: 'Speaking' | 'Listening' | 'Waiting';
  isUser: boolean;
  audioLevel?: number;
}

function ParticipantNode({ participant, isActive, status, isUser, audioLevel = 0 }: ParticipantNodeProps) {
  return (
    <div
      className={`
        group relative flex flex-col items-center transition-all duration-300
        ${isActive ? 'scale-105 z-20' : 'hover:scale-102 z-10'}
      `}
    >
      {/* Outer Hexagon Frame */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        
        {/* Active Speaker Glowing Aura */}
        {isActive && (
          <div className="absolute -inset-2 bg-gradient-to-r from-[#ff1e2d] via-[#ffc400] to-[#ff1e2d] clip-hex-regular animate-pulse opacity-90 blur-sm shadow-[0_0_30px_#ff1e2d]" />
        )}

        {/* Hexagon Border */}
        <div
          className={`
            absolute inset-0 clip-hex-regular transition-all duration-200
            ${isActive 
              ? 'bg-gradient-to-br from-[#ffc400] via-[#ff1e2d] to-[#ffe066]' 
              : isUser
                ? 'bg-[#ffc400]/40'
                : 'bg-[#291724]'
            }
          `}
        />

        {/* Inner Hexagon Container */}
        <div className="absolute inset-[2.5px] bg-[#0c080c] clip-hex-regular flex flex-col items-center justify-center overflow-hidden">
          
          {/* Avatar initial or icon */}
          <div className="relative z-10 font-display font-black text-lg sm:text-xl text-white">
            {isUser ? (
              <span className="text-[#ffc400]">YOU</span>
            ) : participant.role === 'moderator' ? (
              <Shield className="w-5 h-5 text-[#ffc400]" />
            ) : (
              <span>{participant.name.split(' ')[0][0]}</span>
            )}
          </div>

          {/* Voice Waveform Overlay if Active */}
          {isActive && (
            <div className="absolute bottom-2 flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-full bg-[#ffc400] animate-voice-wave" />
              <span className="w-0.5 h-full bg-[#ff1e2d] animate-voice-wave [animation-delay:0.2s]" />
              <span className="w-0.5 h-full bg-[#ffe066] animate-voice-wave [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Speaking / Listening / Waiting Status Pill */}
        <div className="absolute -top-2 flex justify-center w-full pointer-events-none">
          {status === 'Speaking' && (
            <span className="px-2 py-0.5 rounded-full bg-[#ff1e2d] text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-[0_0_8px_#ff1e2d] animate-pulse whitespace-nowrap">
              🔴 SPEAKING
            </span>
          )}
          {status === 'Listening' && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 text-[8px] font-mono font-bold tracking-wider uppercase whitespace-nowrap shadow-sm">
              🎧 LISTENING
            </span>
          )}
          {status === 'Waiting' && (
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-900/90 text-zinc-400 border border-zinc-700/40 text-[8px] font-mono font-medium tracking-wider uppercase whitespace-nowrap">
              ⏳ WAITING
            </span>
          )}
        </div>
      </div>

      {/* Participant Name & Personality Tag + AI/YOU Badge */}
      <div className="mt-2 text-center max-w-[130px]">
        <div className="flex items-center justify-center gap-1">
          <span className="font-display font-bold text-xs text-white truncate drop-shadow-md">
            {participant.name}
          </span>
          {/* Persona Type Badge */}
          {isUser ? (
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[#ffc400] text-[8px] font-mono font-bold border border-amber-500/40">
              YOU
            </span>
          ) : participant.role === 'moderator' ? (
            <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold border border-purple-500/40">
              MOD
            </span>
          ) : (
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[8px] font-mono font-bold border border-rose-500/40">
              AI
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span
            className={`
              text-[9px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded-full border truncate
              ${isActive
                ? 'bg-[#ffc400]/20 text-[#ffc400] border-[#ffc400]/60'
                : 'bg-black/60 text-zinc-400 border-[#2d1825]'
              }
            `}
          >
            {participant.personality}
          </span>
        </div>

        {/* Live Mic Audio Level indicator for User */}
        {isUser && (
          <div className="w-16 mx-auto h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden border border-zinc-700/50">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-[#ffc400] transition-all duration-100"
              style={{ width: `${Math.min(100, Math.max(8, audioLevel * 100))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
