import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !form.name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 🎉');
      } else {
        await signup(form.email, form.password, form.name);
        toast.success(`Welcome aboard, ${form.name}! 🚀`);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found with this email.'
        : err.code === 'auth/wrong-password' ? 'Incorrect password. Please try again.'
        : err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.'
        : err.code === 'auth/invalid-email' ? 'Please enter a valid email address.'
        : err.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          fontFamily: 'var(--font-body)',
        },
      }} />
      <div className="animated-bg" />

      {/* Decorative stars */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="star" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
        }} />
      ))}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        maxWidth: '900px',
        width: '100%',
        alignItems: 'center',
      }}>
        {/* Left: Hero */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          className="login-hero"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              background: 'var(--gradient-blue)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              boxShadow: 'var(--shadow-glow-blue)',
            }}>🎙️</div>
            <div>
              <h1 style={{
                fontSize: '1.6rem',
                background: 'var(--gradient-blue)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-display)',
                marginBottom: '2px',
              }}>SpeakUp Coach</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>AI-Powered English Practice</p>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '2rem', lineHeight: 1.2, marginBottom: '16px' }}>
              Speak English with<br />
              <span style={{
                background: 'var(--gradient-blue)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Confidence</span>
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Practice real English conversations with instant AI feedback. Get corrected, learn better phrases, and improve every day.
            </p>
          </div>

          {/* Feature Pills */}
          {[
            { icon: '🤖', text: 'AI-powered feedback' },
            { icon: '🎙️', text: 'Voice recognition' },
            { icon: '📈', text: 'Track your progress' },
            { icon: '🔥', text: 'Daily streak rewards' },
          ].map((f) => (
            <div key={f.text} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '18px' }}>{f.icon}</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Right: Auth Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card"
          style={{ padding: '36px' }}
        >
          {/* Mode toggle tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {[
              { id: 'login', label: 'Sign In' },
              { id: 'signup', label: 'Sign Up' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`btn-tab-${tab.id}`}
                onClick={() => setMode(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: mode === tab.id ? 'white' : 'var(--color-text-secondary)',
                  background: mode === tab.id ? 'var(--gradient-blue)' : 'transparent',
                  transition: 'all 0.2s ease',
                  boxShadow: mode === tab.id ? 'var(--shadow-glow-blue)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    id="input-name"
                    className="input-field"
                    type="text"
                    name="name"
                    placeholder="e.g. Sarah Johnson"
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  id="input-email"
                  className="input-field"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoFocus={mode === 'login'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="input-password"
                    className="input-field"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    id="btn-toggle-password"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      color: 'var(--color-text-muted)',
                      fontSize: '16px',
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-auth"
                className="btn-primary"
                type="submit"
                disabled={loading}
                style={{ marginTop: '4px', width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? '→ Sign In' : '→ Create Account'}</span>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="divider" style={{ margin: '20px 0' }}>or continue with</div>

          {/* Google Sign In */}
          <button
            id="btn-google-signin"
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => !googleLoading && (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            {googleLoading ? (
              <div className="spinner spinner-sm" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
            marginTop: '20px',
          }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>

      {/* Mobile: make hero hidden */}
      <style>{`
        @media (max-width: 640px) {
          .login-hero { display: none !important; }
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
