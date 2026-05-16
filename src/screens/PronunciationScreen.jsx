import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import MicButton from '../components/MicButton';
import { PRONUNCIATION_TARGETS } from '../firebase/learningData';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useConfetti, playSound } from '../hooks/useConfettiSound';
import '../learning.css';

function calcScore(target, spoken) {
  const t = target.toLowerCase().replace(/[^a-z\s]/g, '').split(' ');
  const s = spoken.toLowerCase().replace(/[^a-z\s]/g, '').split(' ');
  let matches = 0;
  t.forEach((word, i) => { if (s[i] === word) matches++; });
  return Math.round((matches / t.length) * 100);
}

function getScoreLabel(score) {
  if (score >= 90) return { label: '🎉 Excellent!', color: 'var(--color-accent-green)' };
  if (score >= 70) return { label: '👍 Good job! Keep practicing', color: 'var(--color-accent-blue)' };
  return { label: '🎯 Let\'s try again!', color: 'var(--color-accent-orange)' };
}

function ScoreRing({ score }) {
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 90 ? 'var(--color-accent-green)' : score >= 70 ? 'var(--color-accent-blue)' : 'var(--color-accent-orange)';

  return (
    <div className="score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-ring-percent" style={{ color }}>{score}%</span>
        <span className="score-ring-label">score</span>
      </div>
    </div>
  );
}

const LEVELS = ['Word', 'Sentence'];

export default function PronunciationScreen() {
  const { launchConfetti } = useConfetti();
  const [filterLevel, setFilterLevel] = useState('All');
  const [targetIdx, setTargetIdx]     = useState(0);
  const [score, setScore]             = useState(null);
  const [wordResults, setWordResults] = useState([]);
  const [tried, setTried]             = useState(false);

  const { speak, isSpeaking } = useSpeechSynthesis();
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const targets = filterLevel === 'All' ? PRONUNCIATION_TARGETS : PRONUNCIATION_TARGETS.filter(t => t.level === filterLevel);
  const target  = targets[targetIdx % targets.length];

  const handleHear = () => { speak(target.text, { rate: 0.8 }); };

  const handleTry = () => {
    if (isListening) {
      stopListening();
      setTimeout(() => {
        if (!transcript) return;
        const s = calcScore(target.text, transcript);
        setScore(s);
        setTried(true);
        const targetWords = target.text.toLowerCase().replace(/[^a-z\s]/g, '').split(' ');
        const spokenWords = transcript.toLowerCase().replace(/[^a-z\s]/g, '').split(' ');
        setWordResults(targetWords.map((w, i) => ({ word: w, ok: spokenWords[i] === w })));
        if (s >= 90) { playSound('correct'); launchConfetti(50); }
        else if (s >= 70) playSound('chime');
        else playSound('wrong');
      }, 600);
    } else {
      resetTranscript();
      setScore(null);
      setWordResults([]);
      setTried(false);
      startListening();
    }
  };

  const handleNext = () => {
    setTargetIdx(i => (i + 1) % targets.length);
    setScore(null);
    setWordResults([]);
    setTried(false);
    resetTranscript();
  };

  const scoreInfo = score !== null ? getScoreLabel(score) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="animated-bg" />
      <Navbar />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px 64px' }}>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🟠</span>
            <h1 style={{ fontSize: '1.5rem' }}>Pronunciation Coach</h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '6px' }}>Hear the correct pronunciation, then speak it yourself</p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {['All', ...LEVELS].map(lv => (
            <button key={lv} onClick={() => { setFilterLevel(lv); setTargetIdx(0); setScore(null); setTried(false); resetTranscript(); }}
              style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: filterLevel === lv ? 'rgba(255,159,10,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filterLevel === lv ? 'rgba(255,159,10,0.4)' : 'var(--color-border)'}`,
                color: filterLevel === lv ? 'var(--color-accent-orange)' : 'var(--color-text-muted)',
              }}>{lv}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={target?.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,159,10,0.12)', color: 'var(--color-accent-orange)' }}>
                  {target?.level}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {targetIdx % targets.length + 1} / {targets.length}
                </span>
              </div>

              {/* Target text */}
              <div className="target-word">{target?.text}</div>

              {/* Step 1: Hear it */}
              <button className="btn-secondary" onClick={handleHear} disabled={isSpeaking}
                style={{ marginBottom: '24px', padding: '12px 32px', borderColor: 'rgba(255,159,10,0.3)', color: isSpeaking ? 'var(--color-accent-orange)' : undefined }}
              >
                {isSpeaking ? '🔊 Speaking...' : '🔊 Hear it First'}
              </button>

              {/* Step 2: Mic */}
              {!isSupported && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '20px', color: 'var(--color-accent-orange)', fontSize: '0.85rem' }}>
                  ⚠️ Please use Chrome for voice recording
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  {isListening ? '🔴 Listening... speak now!' : 'Now you try:'}
                </p>
                <MicButton isListening={isListening} isDisabled={!isSupported} onClick={handleTry} />
              </div>

              {/* Live transcript */}
              {transcript && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '6px' }}>You said:</p>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>"{transcript}"</p>
                </motion.div>
              )}

              {/* Score ring */}
              {tried && score !== null && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="score-ring-container">
                    <ScoreRing score={score} />
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: scoreInfo.color }}>{scoreInfo.label}</p>
                  </div>

                  {/* Word-by-word breakdown */}
                  {wordResults.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Word Breakdown</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
                        {wordResults.map((w, i) => (
                          <span key={i} className={`pron-word ${w.ok ? 'ok' : 'miss'}`}>{w.word}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => { setScore(null); setTried(false); resetTranscript(); setWordResults([]); }} style={{ flex: 1, justifyContent: 'center' }}>
                      🔁 Try Again
                    </button>
                    <button className="btn-primary" onClick={handleNext} style={{ flex: 1, justifyContent: 'center', background: 'var(--gradient-orange)' }}>
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
