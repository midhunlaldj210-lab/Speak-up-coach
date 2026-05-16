import React from 'react';
import { motion } from 'framer-motion';

const CARD_CONFIGS = {
  correction: {
    label: 'Correction',
    icon: '✏️',
    gradient: 'linear-gradient(135deg, rgba(255, 69, 58, 0.12), rgba(255, 69, 58, 0.05))',
    border: 'rgba(255, 69, 58, 0.25)',
    accent: 'var(--color-accent-red)',
    tagBg: 'rgba(255, 69, 58, 0.15)',
    description: 'Grammar fixes',
  },
  explanation: {
    label: 'Explanation',
    icon: '💡',
    gradient: 'linear-gradient(135deg, rgba(255, 159, 10, 0.12), rgba(255, 159, 10, 0.05))',
    border: 'rgba(255, 159, 10, 0.25)',
    accent: 'var(--color-accent-orange)',
    tagBg: 'rgba(255, 159, 10, 0.15)',
    description: 'Why it was wrong',
  },
  betterSentence: {
    label: 'Better Sentence',
    icon: '⭐',
    gradient: 'linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(10, 132, 255, 0.05))',
    border: 'rgba(10, 132, 255, 0.25)',
    accent: 'var(--color-accent-blue)',
    tagBg: 'rgba(10, 132, 255, 0.15)',
    description: 'More natural phrasing',
  },
  aiReply: {
    label: 'AI Reply',
    icon: '🤖',
    gradient: 'linear-gradient(135deg, rgba(0, 201, 167, 0.12), rgba(0, 201, 167, 0.05))',
    border: 'rgba(0, 201, 167, 0.25)',
    accent: 'var(--color-accent-teal)',
    tagBg: 'rgba(0, 201, 167, 0.15)',
    description: 'Continue the conversation',
  },
};

export function FeedbackCard({ type, content, index = 0 }) {
  const config = CARD_CONFIGS[type] || CARD_CONFIGS.correction;
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        background: config.gradient,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: '12px',
        bottom: '12px',
        width: '3px',
        background: config.accent,
        borderRadius: '0 4px 4px 0',
      }} />

      <div style={{ paddingLeft: '8px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
        }}>
          <span style={{ fontSize: '18px' }}>{config.icon}</span>
          <span style={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: config.accent,
            letterSpacing: '0.02em',
          }}>
            {config.label}
          </span>
          <span style={{
            padding: '2px 8px',
            background: config.tagBg,
            color: config.accent,
            borderRadius: 'var(--radius-full)',
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginLeft: 'auto',
          }}>
            {config.description}
          </span>
        </div>

        {/* Content */}
        <p style={{
          color: 'var(--color-text-primary)',
          fontSize: '0.925rem',
          lineHeight: 1.65,
          fontWeight: type === 'aiReply' ? 500 : 400,
        }}>
          {content}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  const cardOrder = ['correction', 'explanation', 'betterSentence', 'aiReply'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {cardOrder.map((type, idx) => (
        <FeedbackCard
          key={type}
          type={type}
          content={feedback[type]}
          index={idx}
        />
      ))}
    </div>
  );
}
