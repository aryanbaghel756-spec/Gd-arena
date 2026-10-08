import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export function EndDiscussionModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-md p-6 bg-arena-surface/95 border border-white/10 rounded-xl shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              End this discussion?
            </h3>
            <p className="text-xs text-slate-400">
              Conclude speaking turns and evaluate session metrics
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          You’ll receive your performance report based on this session. All turns, idea contributions, and interruption events will be analyzed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
          <Button variant="secondary" onClick={onCancel} size="default">
            CONTINUE DISCUSSION
          </Button>
          <Button variant="danger" onClick={onConfirm} size="default">
            END GD
          </Button>
        </div>
      </div>
    </div>
  );
}
