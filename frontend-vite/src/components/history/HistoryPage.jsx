import React, { useState } from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { History, Clock, Users, Award, ChevronRight, Search, Sliders } from 'lucide-react';
import { EmptyStateVector } from '../../assets/vectors/EmptyStateVector';

export function HistoryPage() {
  const { sessionsHistory, viewReport, navigate } = useDiscussion();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sessionsHistory.filter(s =>
    s.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="badge" style={{ marginBottom: '8px', background: 'rgba(34,211,238,0.08)', color: 'var(--accent-cyan)' }}>
            <History size={14} /> PRACTICE LOG
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '4px' }}>
            Discussion History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review past transcripts, skill trajectories, and transcript-linked coaching points.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by topic..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(13, 18, 34, 0.8)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <EmptyStateVector type="sessions" />
          <h3 style={{ fontSize: '1.2rem', marginTop: '16px', marginBottom: '8px' }}>No Sessions Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {searchQuery ? "No practice sessions match your search query." : "You haven't completed any discussions yet."}
          </p>
          <button onClick={() => navigate('setup')} className="btn-primary">
            Start Your First GD
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(sess => (
            <div
              key={sess.id}
              onClick={() => viewReport(sess)}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px' }}>
                  {sess.topic}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>{sess.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {sess.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} /> {sess.aiCount || 4} AI Participants
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: sess.score >= 80 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: sess.score >= 80 ? '#10B981' : '#F59E0B',
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'Space Grotesk'
                }}>
                  {sess.score}/100
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
