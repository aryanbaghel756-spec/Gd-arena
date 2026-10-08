import React from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { LineChart, Sparkles, TrendingUp, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export function InsightsPage() {
  const { sessionsHistory, navigate } = useDiscussion();

  const competencies = [
    { name: "Opening & Initiative", score: 4.6, growth: "+12%", status: "Strongest", desc: "Consistently establishes early presence and frames the core discussion premise." },
    { name: "Building on Others", score: 4.3, growth: "+8%", status: "Good", desc: "Constructively references teammates and incorporates previous data points." },
    { name: "Clarity & Articulation", score: 4.1, growth: "+5%", status: "Good", desc: "Low filler-word rate with concise arguments within the 60s per-turn window." },
    { name: "Active Listening", score: 3.9, growth: "+4%", status: "Developing", desc: "Respectful turn-taking with minimal interjections outside strategic moments." },
    { name: "Balanced Participation", score: 4.2, growth: "+10%", status: "Good", desc: "Speaking duration aligns closely with team fair-share benchmarks." }
  ];

  return (
    <div style={{
      maxWidth: '1120px',
      margin: '0 auto',
      padding: '36px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      {/* Header */}
      <div>
        <div className="badge" style={{ marginBottom: '8px', background: 'rgba(34,211,238,0.08)', color: 'var(--accent-cyan)' }}>
          <LineChart size={14} /> LONGITUDINAL ANALYTICS
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '4px' }}>
          Performance Insights & Growth
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Aggregated competency metrics across your {sessionsHistory.length} completed discussion simulations.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '10px' }}>
            <TrendingUp size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Recent Trajectory</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Consistent Upward Momentum
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your overall score improved from 79 to 88 over your last 3 discussions, with marked gains in Opening Framing.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
            <Sparkles size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Competitive Benchmark</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Top Tier Readiness
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your 84 composite average places you in the upper bracket for university placement GDs and IIM/CAT GD-PI preparation.
          </p>
        </div>
      </div>

      {/* Competency Deep Dive */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Competency Progression Breakdown</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {competencies.map(c => (
            <div
              key={c.name}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: '220px 100px 1fr 80px',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.status}</div>
              </div>

              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                {c.score.toFixed(1)} / 5.0
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {c.desc}
              </div>

              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: '#10B981' }}>
                {c.growth}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Card */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(34,211,238,0.25)'
      }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Ready to push your scores higher?</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Challenge Kabir and Rohan on a controversial topic to hone counter-argument agility.</p>
        </div>
        <button onClick={() => navigate('setup')} className="btn-primary">
          <span>Start Next GD</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
