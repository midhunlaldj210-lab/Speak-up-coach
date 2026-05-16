import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(dateVal) {
  if (!dateVal) return 'Unknown date';
  const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getRelativeTime(dateVal) {
  if (!dateVal) return '';
  const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(dateVal);
}

const LEVEL_COLORS = {
  Beginner: { color: 'var(--color-accent-green)', bg: 'rgba(48, 209, 88, 0.12)', icon: '🌱' },
  Intermediate: { color: 'var(--color-accent-blue)', bg: 'rgba(10, 132, 255, 0.12)', icon: '🚀' },
  Advanced: { color: 'var(--color-accent-purple)', bg: 'rgba(191, 90, 242, 0.12)', icon: '⚡' },
};

export default function ProgressScreen() {
  const { user, userProfile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      if (!user) return;
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const q = query(sessionsRef, orderBy('date', 'desc'));
        const snap = await getDocs(q);
        setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [user]);

  // Compute aggregate stats
  const totalExchanges = sessions.reduce((s, sess) => s + (sess.exchangeCount || 0), 0);
  // totalCorrections available via sessions if needed for future charts
  const averageScore = sessions.length === 0 ? 0 :
    Math.round(sessions.reduce((s, sess) => {
      const ex = sess.exchangeCount || 1;
      const cor = sess.correctionCount || 0;
      return s + Math.max(0, ((ex - cor) / ex) * 100);
    }, 0) / sessions.length);

  // Level distribution
  const levelCounts = sessions.reduce((acc, s) => {
    acc[s.taskLevel] = (acc[s.taskLevel] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="animated-bg" />
      <Navbar />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{ marginBottom: '8px' }}>My Progress</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Track your English speaking journey over time
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'Day Streak', value: userProfile?.streak || 0, icon: '🔥', color: 'var(--color-accent-orange)', bg: 'rgba(255, 159, 10, 0.1)', border: 'rgba(255, 159, 10, 0.2)' },
            { label: 'Sessions', value: sessions.length, icon: '🎯', color: 'var(--color-accent-blue)', bg: 'rgba(10, 132, 255, 0.1)', border: 'rgba(10, 132, 255, 0.2)' },
            { label: 'Exchanges', value: totalExchanges, icon: '💬', color: 'var(--color-accent-teal)', bg: 'rgba(0, 201, 167, 0.1)', border: 'rgba(0, 201, 167, 0.2)' },
            { label: 'Avg Score', value: `${averageScore}%`, icon: '⭐', color: 'var(--color-accent-green)', bg: 'rgba(48, 209, 88, 0.1)', border: 'rgba(48, 209, 88, 0.2)' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: '20px 16px',
                background: stat.bg,
                border: `1px solid ${stat.border}`,
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Level Distribution */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card"
            style={{ padding: '24px', marginBottom: '28px' }}
          >
            <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Practice Breakdown</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(levelCounts).map(([level, count]) => {
                const meta = LEVEL_COLORS[level] || LEVEL_COLORS.Beginner;
                const pct = Math.round((count / sessions.length) * 100);
                return (
                  <div key={level} style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {meta.icon} {level}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: meta.color, fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{
                          height: '100%',
                          background: meta.color,
                          borderRadius: 'var(--radius-full)',
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '1.2rem' }}>Session History</h2>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <LoadingSpinner text="Loading your sessions..." />
            </div>
          ) : sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '56px' }}>🎙️</div>
              <h3 style={{ fontSize: '1.2rem' }}>No sessions yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '340px' }}>
                Complete your first speaking practice session to see your progress history here.
              </p>
              <a
                href="/dashboard"
                id="btn-start-first-session"
                className="btn-primary"
                style={{ textDecoration: 'none', marginTop: '8px' }}
              >
                🚀 Start Practicing
              </a>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map((session, idx) => {
                const meta = LEVEL_COLORS[session.taskLevel] || LEVEL_COLORS.Beginner;
                const score = Math.max(0, Math.round(
                  ((( session.exchangeCount || 0) - (session.correctionCount || 0)) /
                  Math.max(session.exchangeCount || 1, 1)) * 100
                ));

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="glass-card"
                    style={{ padding: '20px 24px' }}
                    id={`session-${session.id}`}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}>
                      {/* Level Icon */}
                      <div style={{
                        width: '44px', height: '44px',
                        background: meta.bg,
                        border: `1px solid ${meta.color}30`,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', flexShrink: 0,
                      }}>
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {session.taskTitle}
                          </h3>
                          <span style={{
                            padding: '2px 8px',
                            background: meta.bg,
                            color: meta.color,
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}>
                            {session.taskLevel}
                          </span>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          {getRelativeTime(session.date)}
                        </p>
                      </div>

                      {/* Stats chips */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{
                          padding: '4px 10px',
                          background: 'rgba(0, 201, 167, 0.1)',
                          color: 'var(--color-accent-teal)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          💬 {session.exchangeCount || 0} exchanges
                        </div>
                        <div style={{
                          padding: '4px 10px',
                          background: 'rgba(255, 69, 58, 0.1)',
                          color: 'var(--color-accent-red)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          ✏️ {session.correctionCount || 0} corrections
                        </div>
                        {/* Score */}
                        <div style={{
                          padding: '4px 12px',
                          background: score >= 70
                            ? 'rgba(48, 209, 88, 0.12)'
                            : score >= 40
                              ? 'rgba(10, 132, 255, 0.12)'
                              : 'rgba(255, 159, 10, 0.12)',
                          color: score >= 70
                            ? 'var(--color-accent-green)'
                            : score >= 40
                              ? 'var(--color-accent-blue)'
                              : 'var(--color-accent-orange)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                        }}>
                          {score}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
