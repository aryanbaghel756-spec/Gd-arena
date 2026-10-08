import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDiscussion } from '../../context/DiscussionContext';
import { VoiceActivityVector, AiAnalysisVector, ScoreGaugeVector, DiscussionAnalyticsVector } from '../../assets/vectors/DashboardVectors';
import { Mic2, ArrowRight, Clock, Award, Users, ChevronRight, Zap, Target } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { navigate, sessionsHistory, viewReport } = useDiscussion();

  const totalSessions = sessionsHistory.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessionsHistory.reduce((acc, s) => acc + s.score, 0) / totalSessions)
    : 84;

  const totalSpeakingMins = Math.round(
    sessionsHistory.reduce((acc, s) => acc + (s.metrics ? s.metrics.studentSeconds : 50), 0) / 60
  );

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '36px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* 1. Welcome Card Banner */}
      <section className="glass-panel" style={{
        padding: '32px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(13, 18, 34, 0.9) 0%, rgba(22, 32, 60, 0.7) 100%)',
        border: '1px solid rgba(34, 211, 238, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1, maxWidth: '640px' }}>
          <div className="badge" style={{ marginBottom: '10px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-magenta)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
            STUDENT DASHBOARD • READY
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '8px' }}>
            Good afternoon, {user ? user.name.split(' ')[0] : 'Aryan'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Ready for your next discussion session? Practice with simulated AI peers, refine your articulation, and target competitive GD standards.
          </p>

          <button
            onClick={() => navigate('setup')}
            className="btn-primary"
            style={{ padding: '0 24px', fontSize: '0.92rem' }}
          >
            <Mic2 size={16} />
            <span>START GD</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
      </section>

      {/* 2. Quick Statistics Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px'
      }}>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Sessions Completed
            </span>
            <ScoreGaugeVector />
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'Space Grotesk', fontWeight: 800 }}>
            {totalSessions}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            +2 sessions this week
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Average Readiness Score
            </span>
            <AiAnalysisVector />
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {avgScore}<span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/100</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Top 15th percentile benchmark
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Cumulative Speaking Time
            </span>
            <VoiceActivityVector />
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'Space Grotesk', fontWeight: 800 }}>
            {totalSpeakingMins}<span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>m</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Across all practice sessions
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Discussions This Week
            </span>
            <DiscussionAnalyticsVector />
          </div>
          <div style={{ fontSize: '2.2rem', fontFamily: 'Space Grotesk', fontWeight: 800, color: '#8B5CF6' }}>
            3
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px', display: 'block' }}>
            Target: 4 sessions / week
          </span>
        </div>
      </section>

      {/* 3. Main Dashboard Body: Recent Sessions & Performance Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '24px'
      }}>
        {/* Recent Practice List */}
        <section className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Recent Practice Sessions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click any session to view the full audit report</p>
            </div>
            <button
              onClick={() => navigate('history')}
              className="btn-ghost"
              style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}
            >
              View All History
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessionsHistory.slice(0, 4).map(sess => (
              <div
                key={sess.id}
                onClick={() => viewReport(sess)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '4px' }}>
                    {sess.topic}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{sess.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {sess.duration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {sess.aiCount} AIs
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: sess.score >= 80 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    color: sess.score >= 80 ? '#10B981' : '#F59E0B',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}>
                    {sess.score}/100
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Insights Sidebar */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />
              Competency Diagnosis
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Strongest */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: '3px' }}>
                  Top Core Strength
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
                  Opening & Initiative (4.8 / 5.0)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Consistently takes the floor early with structured thesis framing.
                </div>
              </div>

              {/* Needs Improvement */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '3px' }}>
                  Growth Opportunity
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
                  Interruption Timing (3.8 / 5.0)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Practice waiting for teammates to finish closing statements before jumping in.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Tip */}
          <div className="glass-panel" style={{
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(13, 18, 34, 0.8) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Target size={18} style={{ color: 'var(--accent-violet)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Hackathon Tip</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use the <strong>Spacebar</strong> during the live room to seamlessly speak, or interject while Kabir is talking to demonstrate the instant interruption engine!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
