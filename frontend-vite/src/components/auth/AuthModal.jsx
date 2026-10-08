import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDiscussion } from '../../context/DiscussionContext';
import { AuthFlowVector } from '../../assets/vectors/AuthFlowVector';
import { X, Sparkles, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, authModalTab, setAuthModalTab, closeAuthModal, login, signup, demoLogin } = useAuth();
  const { navigate, addToast } = useDiscussion();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  if (!authModalOpen) return null;

  function calculatePasswordStrength(pass) {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return Math.min(100, score);
  }

  const passStrength = calculatePasswordStrength(password);

  function handleSignIn(e) {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please enter email and password", "warning");
      return;
    }
    login(email, password);
    addToast(`Welcome back, ${email.split('@')[0]}!`, "success");
    navigate('dashboard');
  }

  function handleSignUp(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    if (password !== confirmPassword) {
      addToast("Passwords do not match", "warning");
      return;
    }
    if (!agreeTerms) {
      addToast("Please accept the terms to continue", "warning");
      return;
    }
    signup(name, email, password);
    addToast(`Account created! Welcome, ${name}.`, "success");
    navigate('dashboard');
  }

  function handleDemoUser() {
    demoLogin();
    addToast("Logged in as Demo User: Aryan Sharma", "success");
    navigate('dashboard');
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(7, 10, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="btn-ghost"
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, padding: '8px' }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Left Side: Futuristic Visual & Demo Pass */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(13, 18, 34, 0.95), rgba(7, 10, 19, 0.98))',
          padding: '36px 30px',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div className="badge" style={{ marginBottom: '14px', background: 'rgba(34, 211, 238, 0.08)', color: 'var(--accent-cyan)' }}>
              <ShieldCheck size={14} /> Secure Practice Arena
            </div>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '8px' }}>
              Real-Time AI Group Discussion
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Benchmark your communication skills against dynamic AI personas with voice synthesis and transcript auditing.
            </p>
          </div>

          <div style={{ margin: '20px 0' }}>
            <AuthFlowVector />
          </div>

          {/* Quick Demo Access Button */}
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(34, 211, 238, 0.06)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              Hackathon Evaluation Mode
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Jump straight to the dashboard with seeded history
            </div>
            <button
              onClick={handleDemoUser}
              className="btn-primary"
              style={{ width: '100%', fontSize: '0.88rem', padding: '10px 16px' }}
            >
              <Sparkles size={16} /> Continue as Demo User
            </button>
          </div>
        </div>

        {/* Right Side: Tabbed Form */}
        <div style={{ padding: '36px 32px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setAuthModalTab('signin')}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: authModalTab === 'signin' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: authModalTab === 'signin' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModalTab('signup')}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: authModalTab === 'signup' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: authModalTab === 'signup' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>

          {authModalTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. aryan.sharma@campus.edu"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', cursor: 'pointer' }}>
                    Forgot Password?
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Sign In to Arena <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Aryan Sharma"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
                {password && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${passStrength}%`,
                        background: passStrength > 70 ? '#10B981' : passStrength > 40 ? '#F59E0B' : '#EF4444',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Strength: {passStrength > 70 ? 'Strong' : passStrength > 40 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(10, 14, 26, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agreeTerms" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  I agree to the practice code of conduct and audio evaluation
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                Create Student Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
