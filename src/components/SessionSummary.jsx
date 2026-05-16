import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SessionSummary({ taskTitle, exchanges, corrections, onRestart }) {
  const navigate = useNavigate();

  const validCorrections = corrections.filter(
    (c) => c.correction && !c.correction.toLowerCase().includes('no correction')
  );
  const perfectRounds = corrections.filter(
    (c) => c.correction && c.correction.toLowerCase().includes('no correction')
  ).length;

  const score = Math.max(0, Math.min(100,
    Math.round(((exchanges.length - validCorrections.length) / Math.max(exchanges.length, 1)) * 100)
  ));

  const getScoreColor = () => {
    if (score >= 80) return 'var(--color-accent-green)';
    if (score >= 50) return 'var(--color-accent-blue)';
    return 'var(--color-accent-orange)';
  };

  const getScoreMessage = () => {
    if (score >= 90) return { emoji: '🌟', msg: 'Outstanding! Your English is excellent!' };
    if (score >= 70) return { emoji: '🎉', msg: 'Great job! Keep up the momentum!' };
    if (score >= 50) return { emoji: '💪', msg: 'Good effort! Practice makes perfect!' };
    return { emoji: '📚', msg: 'Keep practicing — you\'re improving every day!' };
  };

  const { emoji, msg } = getScoreMessage();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="animated-bg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{
          maxWidth: '680px',
          width: '100%',
        }}
      >
        {/* Header Card */}
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>{emoji}</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Session Complete!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {taskTitle}
          </p>

          {/* Score Circle */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `6px solid ${getScoreColor()}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            background: `${getScoreColor()}12`,
            boxShadow: `0 0 32px ${getScoreColor()}30`,
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor() }}>{score}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>SCORE</span>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{msg}</p>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '24px',
          }}>
            {[
              { label: 'Exchanges', value: exchanges.length, color: 'var(--color-accent-blue)', icon: '💬' },
              { label: 'Corrections', value: validCorrections.length, color: 'var(--color-accent-orange)', icon: '✏️' },
              { label: 'Perfect', value: perfectRounds, color: 'var(--color-accent-green)', icon: '✅' },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: `${stat.color}10`,
                border: `1px solid ${stat.color}25`,
                borderRadius: 'var(--radius-md)',
                padding: '16px 8px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Corrections Review */}
        {validCorrections.length > 0 && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
              📝 Corrections to Remember
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {validCorrections.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: 'rgba(255, 69, 58, 0.06)',
                    border: '1px solid rgba(255, 69, 58, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}
                >
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-accent-red)',
                      letterSpacing: '0.08em',
                    }}>
                      Exchange {i + 1} · You said:
                    </span>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                      marginTop: '4px',
                    }}>
                      "{c.userSaid}"
                    </p>
                  </div>
                  <div style={{
                    borderTop: '1px solid rgba(255, 69, 58, 0.12)',
                    paddingTop: '8px',
                  }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-accent-green)',
                      letterSpacing: '0.08em',
                    }}>
                      Better:
                    </span>
                    <p style={{ color: 'var(--color-text-primary)', fontSize: '0.875rem', marginTop: '4px' }}>
                      {c.correction}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            id="btn-practice-again"
            className="btn-primary"
            onClick={onRestart}
            style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
          >
            🔄 Practice Again
          </button>
          <button
            id="btn-go-dashboard"
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
          >
            🏠 Dashboard
          </button>
          <button
            id="btn-view-progress"
            className="btn-ghost"
            onClick={() => navigate('/progress')}
            style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
          >
            📈 My Progress
          </button>
        </div>
      </motion.div>
    </div>
  );
}
