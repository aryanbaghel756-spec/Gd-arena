import React from 'react';
import { useDiscussion } from '../../context/DiscussionContext';
import { Info, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useDiscussion();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
      aria-live="assertive"
    >
      {toasts.map(t => {
        let borderColor = 'rgba(255, 255, 255, 0.1)';
        let IconComp = Info;
        let iconColor = 'var(--accent-cyan)';

        if (t.type === 'error') {
          borderColor = 'rgba(239, 68, 68, 0.5)';
          IconComp = AlertCircle;
          iconColor = '#EF4444';
        } else if (t.type === 'warning') {
          borderColor = 'rgba(245, 158, 11, 0.5)';
          IconComp = AlertTriangle;
          iconColor = '#F59E0B';
        } else if (t.type === 'success') {
          borderColor = 'rgba(16, 185, 129, 0.5)';
          IconComp = CheckCircle2;
          iconColor = '#10B981';
        }

        return (
          <div
            key={t.id}
            className="glass-panel"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${iconColor}`,
              borderColor: borderColor,
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              animation: 'fadeSlideIn 0.3s ease-out',
              maxWidth: '380px'
            }}
          >
            <IconComp size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </aside>
  );
}
