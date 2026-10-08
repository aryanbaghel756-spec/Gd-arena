import React from 'react';
import { Shield, Volume2, Clock, Sparkles } from 'lucide-react';

export function ModeratorCard({ status = 'idle', currentInstruction = '', turnTimeRemaining = 60 }) {
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'thinking';

  return (
    <div
      className="glass-panel relative overflow-hidden"
      style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(13, 18, 34, 0.95) 60%, rgba(34, 211, 238, 0.08) 100%)',
        border: isSpeaking ? '1.5px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.35)',
        boxShadow: isSpeaking
          ? '0 0 35px rgba(139, 92, 246, 0.45), inset 0 0 20px rgba(139, 92, 246, 0.15)'
          : '0 8px 24px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
    >
      {/* Ambient Violet/Cyan Halo */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '-40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
        filter: 'blur(25px)',
        pointerEvents: 'none'
      }} />

      {/* Left: Moderator Avatar & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: '52px', height: '52px' }}>
          {/* Rotating ring around moderator */}
          <svg
            viewBox="0 0 60 60"
            style={{ position: 'absolute', top: '-4px', left: '-4px', width: '60px', height: '60px' }}
            className={isSpeaking ? "animate-spin-slow origin-center" : ""}
          >
            <circle cx="30" cy="30" r="26" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 6" fill="none" opacity={isSpeaking ? "1" : "0.5"} />
          </svg>

          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: '#131b31',
            border: '2px solid #8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#fff',
            fontFamily: 'Space Grotesk',
            boxShadow: isSpeaking ? '0 0 25px rgba(139, 92, 246, 0.8)' : '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            M
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.08rem', fontFamily: 'Space Grotesk' }}>AI Moderator</span>
            <span className="badge" style={{
              color: '#8B5CF6',
              borderColor: 'rgba(139,92,246,0.4)',
              background: 'rgba(139,92,246,0.12)',
              padding: '2px 8px',
              fontSize: '0.68rem',
              fontWeight: 700
            }}>
              <Shield size={10} /> FACILITATOR
            </span>
            {isSpeaking && (
              <span className="badge" style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.1)', fontSize: '0.68rem' }}>
                Speaking...
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Guides discussion direction · Regulates speaking airtime · Enforces debate decorum
          </div>
        </div>
      </div>

      {/* Right: Live Prompt/Cue & Turn Timing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
        {/* Turn Timing Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(10, 14, 26, 0.8)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}>
          <Clock size={13} style={{ color: '#8B5CF6' }} />
          <span>Turn limit: <strong style={{ color: '#fff' }}>{turnTimeRemaining}s</strong></span>
        </div>

        {/* Guidance Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(10, 14, 26, 0.85)',
          border: isSpeaking ? '1px solid #8B5CF6' : '1px solid var(--border-subtle)',
          fontSize: '0.86rem',
          boxShadow: isSpeaking ? '0 0 15px rgba(139, 92, 246, 0.25)' : 'none'
        }}>
          <Volume2 size={16} style={{ color: '#8B5CF6', flexShrink: 0 }} />
          <span style={{ color: isSpeaking ? 'var(--accent-cyan)' : 'var(--text-primary)', fontWeight: 600 }}>
            {isThinking ? "Formulating guidance..." : currentInstruction || "Moderator: Floor is open"}
          </span>
        </div>
      </div>
    </div>
  );
}
