import React from 'react';
import { motion } from 'framer-motion';

export default function MicButton({ isListening, isDisabled, onClick }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
    }}>
      {/* Pulse rings container */}
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        {/* Outer pulse rings (only when listening) */}
        {isListening && (
          <>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(255, 69, 58, 0.3)',
              animation: 'pulse-ring 1.5s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(255, 69, 58, 0.2)',
              animation: 'pulse-ring 1.5s ease-out infinite 0.5s',
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(255, 69, 58, 0.1)',
              animation: 'pulse-ring-2 2s ease-out infinite 0.25s',
            }} />
          </>
        )}

        {/* Main button */}
        <motion.button
          id="btn-microphone"
          whileHover={{ scale: isDisabled ? 1 : 1.05 }}
          whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          onClick={onClick}
          disabled={isDisabled}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: 'none',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isListening
              ? 'linear-gradient(135deg, #FF453A, #FF6B35)'
              : isDisabled
                ? 'rgba(255,255,255,0.05)'
                : 'var(--gradient-blue)',
            boxShadow: isListening
              ? 'var(--shadow-glow-red), 0 8px 32px rgba(255,69,58,0.4)'
              : isDisabled
                ? 'none'
                : 'var(--shadow-glow-blue), 0 8px 32px rgba(10,132,255,0.3)',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            opacity: isDisabled ? 0.4 : 1,
          }}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? (
            /* Stop icon */
            <div style={{
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '4px',
            }} />
          ) : (
            /* Mic icon */
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" fill="white" />
              <path
                d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center', minHeight: '56px' }}>
        {isListening ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <p style={{
              color: 'var(--color-accent-red)',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.05em',
            }}>
              🔴 Listening...
            </p>
            {/* Waveform bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '24px' }}>
              {[0, 0.1, 0.2, 0.15, 0.3, 0.1, 0.25, 0.05, 0.2, 0.1, 0.3, 0.15].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: `${8 + Math.random() * 14}px`,
                    background: 'var(--color-accent-red)',
                    borderRadius: '2px',
                    animation: `wave 0.8s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              Click the button to stop
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              fontSize: '0.95rem',
              marginBottom: '4px',
            }}>
              {isDisabled ? '⏳ Processing...' : '🎙️ Click to speak'}
            </p>
            {!isDisabled && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Speak clearly in English
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
