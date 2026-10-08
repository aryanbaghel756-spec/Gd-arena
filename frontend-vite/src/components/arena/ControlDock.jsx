import React, { useState, useEffect } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { Mic, Keyboard, Send, SkipForward, AlertCircle, Sparkles } from 'lucide-react';
import { sttService } from '../../services/speechRecognition';

export function ControlDock() {
  const {
    isStudentSpeaking,
    sttInterimText,
    startStudentSpeech,
    stopStudentSpeech,
    submitTypedTurn,
    skipTurn
  } = useDiscussion();

  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [micUnavailable, setMicUnavailable] = useState(!sttService.isSupported);

  // Spacebar Push-to-Talk listener
  useEffect(() => {
    let spaceHeld = false;

    function handleKeyDown(e) {
      if (e.code === 'Space' && !e.repeat) {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea') return;

        e.preventDefault();
        spaceHeld = true;
        startStudentSpeech();
      }
    }

    function handleKeyUp(e) {
      if (e.code === 'Space' && spaceHeld) {
        spaceHeld = false;
        e.preventDefault();
        stopStudentSpeech();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startStudentSpeech, stopStudentSpeech]);

  function handleSendTyped(e) {
    e.preventDefault();
    if (!typedInput.trim()) return;
    submitTypedTurn(typedInput.trim());
    setTypedInput('');
    setTypeDrawerOpen(false);
  }

  return (
    <footer style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      marginTop: 'auto'
    }}>
      {/* Mic Unavailable Alert Banner with Auto-Expose Typed Input */}
      {micUnavailable && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#FCD34D',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <AlertCircle size={14} />
          <span>Microphone unavailable in this browser. Please use typed input below.</span>
        </div>
      )}

      {/* Live STT Partial Preview Tooltip Floating Above Mic */}
      {isStudentSpeaking && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '92px',
            maxWidth: '540px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(10, 14, 26, 0.95)',
            border: '1.5px solid var(--accent-cyan)',
            boxShadow: '0 0 35px rgba(34, 211, 238, 0.5), inset 0 0 15px rgba(34, 211, 238, 0.15)',
            color: 'var(--accent-cyan)',
            fontSize: '0.94rem',
            textAlign: 'center',
            zIndex: 30,
            animation: 'fadeSlideIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} className="animate-ping" />
            <span style={{ fontSize: '0.72rem', color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Live Speech Capture
            </span>
          </div>
          <div style={{ fontWeight: 600 }}>
            {sttInterimText ? `"${sttInterimText}"` : "Listening... Speak clearly or hold spacebar"}
          </div>
        </div>
      )}

      {/* Control Dock Surface */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(13, 18, 34, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Left Side: Type Fallback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button
            type="button"
            onClick={() => setTypeDrawerOpen(!typeDrawerOpen)}
            className="btn-secondary"
            style={{
              fontSize: '0.85rem',
              padding: '9px 16px',
              borderColor: typeDrawerOpen ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              color: typeDrawerOpen ? 'var(--accent-cyan)' : 'var(--text-primary)'
            }}
          >
            <Keyboard size={16} />
            <span>{typeDrawerOpen ? "Close Typing" : "Type Instead"}</span>
          </button>

          {/* Drawer Form */}
          {typeDrawerOpen && (
            <form onSubmit={handleSendTyped} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '440px' }}>
              <input
                type="text"
                value={typedInput}
                onChange={e => setTypedInput(e.target.value)}
                placeholder="Type your point and press Enter..."
                autoFocus
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(10, 14, 26, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.88rem'
                }}
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="btn-primary"
                style={{ padding: '9px 18px', fontSize: '0.86rem' }}
              >
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>
          )}
        </div>

        {/* Center: Push-To-Talk Mic Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); startStudentSpeech(); }}
            onMouseUp={() => { if (isStudentSpeaking) stopStudentSpeech(); }}
            onTouchStart={(e) => { e.preventDefault(); startStudentSpeech(); }}
            onTouchEnd={() => { if (isStudentSpeaking) stopStudentSpeech(); }}
            style={{
              width: '66px',
              height: '66px',
              borderRadius: '50%',
              background: isStudentSpeaking
                ? 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)'
                : 'var(--accent-gradient)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070A13',
              cursor: 'pointer',
              boxShadow: isStudentSpeaking
                ? '0 0 38px rgba(239, 68, 68, 0.8)'
                : '0 0 24px rgba(34, 211, 238, 0.45)',
              transform: isStudentSpeaking ? 'scale(1.08)' : 'scale(1)',
              animation: isStudentSpeaking ? 'recordingPulse 1.2s infinite ease-in-out' : 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              userSelect: 'none'
            }}
            aria-label="Push to talk: hold to speak, release to send"
          >
            <Mic size={28} />
          </button>

          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {isStudentSpeaking ? (
              <strong style={{ color: '#EF4444' }}>Release to Send</strong>
            ) : (
              <>Hold to Speak · <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.68rem' }}>SPACE</kbd></>
            )}
          </span>
        </div>

        {/* Right Side: Skip AI Turn */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: 1 }}>
          <button
            type="button"
            onClick={skipTurn}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '9px 18px', gap: '8px' }}
          >
            <SkipForward size={16} />
            <span>Skip AI Turn</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
