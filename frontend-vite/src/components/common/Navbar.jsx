import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDiscussion } from '../../context/DiscussionContext';
import { Settings, ArrowRight, User, LogOut } from 'lucide-react';
import { Button } from './Button';
import { SettingsModal } from './SettingsModal';

export function Navbar() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { currentScreen, navigate } = useDiscussion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleHowItWorks() {
    if (currentScreen !== 'landing') {
      navigate('landing');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 pt-3 pb-2 transition-all">
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between px-5 py-2.5 rounded-xl transition-all duration-300 ${
            isScrolled
              ? 'bg-arena-surface/85 backdrop-blur-xl border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.7)]'
              : 'bg-arena-surface/60 backdrop-blur-md border border-white/5'
          }`}
        >
          {/* LEFT: GD ARENA logo */}
          <div
            onClick={() => navigate('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Hexagonal arena icon */}
            <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#1b1528] to-[#0c0d12] border border-pink-500/30 group-hover:border-pink-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                GD ARENA
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Practice. Speak. Improve.
              </span>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => navigate('landing')}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                currentScreen === 'landing'
                  ? 'text-white bg-white/5 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('setup')}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                currentScreen === 'setup' || currentScreen === 'arena'
                  ? 'text-pink-400 bg-pink-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              Practice
            </button>
            <button
              onClick={handleHowItWorks}
              className="px-3.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('report')}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                currentScreen === 'report'
                  ? 'text-violet-400 bg-violet-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              Performance
            </button>
          </nav>

          {/* RIGHT: Settings, Sign In, Start GD */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors"
              title="Arena Settings"
            >
              <Settings size={16} />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-xs text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-[10px] font-bold text-pink-300">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium">{user?.name || 'User'}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 p-1.5 rounded-lg bg-arena-surface border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-white/5 text-xs">
                      <p className="font-semibold text-white">{user?.name}</p>
                      <p className="text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors text-left"
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="btn-tertiary !text-xs !px-2.5"
              >
                Sign In
              </button>
            )}

            {/* PRIMARY CTA: START GD */}
            <Button
              variant="primary"
              size="compact"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('setup')}
              className="!h-9 !px-4 !text-xs tracking-wider"
            >
              START GD
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
