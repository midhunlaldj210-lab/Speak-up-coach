import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LEVEL_COLORS = {
  Beginner: {
    gradient: 'var(--gradient-green)',
    badge: 'badge-beginner',
    accent: 'var(--color-accent-green)',
    glow: 'rgba(48, 209, 88, 0.15)',
    icon: '🌱',
  },
  Intermediate: {
    gradient: 'var(--gradient-blue)',
    badge: 'badge-intermediate',
    accent: 'var(--color-accent-blue)',
    glow: 'rgba(10, 132, 255, 0.15)',
    icon: '🚀',
  },
  Advanced: {
    gradient: 'var(--gradient-purple)',
    badge: 'badge-advanced',
    accent: 'var(--color-accent-purple)',
    glow: 'rgba(191, 90, 242, 0.15)',
    icon: '⚡',
  },
};

export default function TaskCard({ task, index = 0 }) {
  const navigate = useNavigate();
  const colors = LEVEL_COLORS[task.level] || LEVEL_COLORS.Beginner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: 'var(--gradient-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s ease',
      }}
      onClick={() => navigate(`/practice/${task.id}`)}
      role="button"
      tabIndex={0}
      id={`task-card-${task.id}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/practice/${task.id}`)}
    >
      {/* Accent top bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: colors.gradient,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          background: colors.glow,
          border: `1px solid ${colors.accent}30`,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}>
          {colors.icon}
        </div>
        <span className={`badge ${colors.badge}`}>{task.level}</span>
      </div>

      {/* Content */}
      <div>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {task.title}
        </h3>
        <p style={{
          fontSize: '0.825rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.prompt}
        </p>
      </div>

      {/* Vocabulary chips */}
      {task.expectedVocabulary && task.expectedVocabulary.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {task.expectedVocabulary.slice(0, 3).map((word) => (
            <span key={word} style={{
              padding: '2px 10px',
              background: `${colors.accent}15`,
              color: colors.accent,
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 600,
              border: `1px solid ${colors.accent}25`,
            }}>
              {word}
            </span>
          ))}
          {task.expectedVocabulary.length > 3 && (
            <span style={{
              padding: '2px 10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
            }}>
              +{task.expectedVocabulary.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Start Button */}
      <button
        id={`btn-start-${task.id}`}
        onClick={(e) => { e.stopPropagation(); navigate(`/practice/${task.id}`); }}
        style={{
          padding: '10px 20px',
          background: colors.gradient,
          color: 'white',
          fontWeight: 700,
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '4px',
          transition: 'opacity 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        <span>Start Practice</span>
        <span>→</span>
      </button>
    </motion.div>
  );
}
