import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : 'spinner';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}>
      <div className={sizeClass} />
      {text && (
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease',
        }}>
          {text}
        </p>
      )}
    </div>
  );
}
