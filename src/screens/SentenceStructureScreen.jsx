import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { SENTENCE_EXERCISES } from '../firebase/learningData';
import { getSentenceFeedback } from '../services/geminiService';
import { useConfetti, playSound } from '../hooks/useConfettiSound';
import '../learning.css';

const LEVEL_COLORS = { Beginner: 'var(--color-accent-green)', Intermediate: 'var(--color-accent-blue)', Advanced: 'var(--color-accent-purple)' };

export default function SentenceStructureScreen() {
  const { launchConfetti } = useConfetti();
  const [activeLevel, setActiveLevel]   = useState('Beginner');
  const [exerciseIdx, setExerciseIdx]   = useState(0);
  const [words, setWords]               = useState(null);
  const [checked, setChecked]           = useState(false);
  const [wordStatus, setWordStatus]     = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading]           = useState(false);
  const [score, setScore]               = useState({ correct: 0, total: 0 });

  const levelExercises = SENTENCE_EXERCISES.filter(e => e.level === activeLevel);
  const exercise = levelExercises[exerciseIdx] || levelExercises[0];

  // Init words when exercise changes
  const initExercise = useCallback((ex) => {
    const shuffled = [...ex.scrambled].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setChecked(false);
    setWordStatus([]);
    setAiExplanation('');
  }, []);

  // Init on first render or level change
  React.useEffect(() => {
    if (exercise) initExercise(exercise);
  }, [exercise, initExercise]);

  const handleCheck = async () => {
    if (!words || checked) return;
    const userAnswer = words.join(' ');
    const correctAnswer = exercise.correct;

    // Color each word
    const correctWords = correctAnswer.toLowerCase().split(' ');
    const status = words.map((w, i) =>
      w.toLowerCase() === (correctWords[i] || '') ? 'correct' : 'wrong'
    );
    setWordStatus(status);
    setChecked(true);

    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    if (isCorrect) {
      playSound('correct');
      launchConfetti(40);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else {
      playSound('wrong');
      setScore(s => ({ ...s, total: s.total + 1 }));
    }

    setLoading(true);
    try {
      const explanation = await getSentenceFeedback(
        exercise.scrambled.join(' / '),
        userAnswer,
        correctAnswer
      );
      setAiExplanation(explanation);
    } catch {
      setAiExplanation('Great attempt! The correct order follows the Subject + Verb + Object + Time pattern.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const nextIdx = (exerciseIdx + 1) % levelExercises.length;
    setExerciseIdx(nextIdx);
  };

  const isCorrect = checked && wordStatus.every(s => s === 'correct');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="animated-bg" />
      <Navbar />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '28px' }}>🔵</span>
            <h1 style={{ fontSize: '1.5rem' }}>Sentence Structure</h1>
            <span className="score-badge" style={{ marginLeft: 'auto', background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.25)', color: 'var(--color-accent-blue)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
              ✅ {score.correct}/{score.total}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Drag and drop words into the correct order
          </p>
        </motion.div>

        {/* Level tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {['Beginner', 'Intermediate', 'Advanced'].map(lv => (
            <button key={lv}
              onClick={() => { setActiveLevel(lv); setExerciseIdx(0); }}
              style={{
                padding: '6px 18px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600,
                background: activeLevel === lv ? `${LEVEL_COLORS[lv]}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeLevel === lv ? LEVEL_COLORS[lv] : 'var(--color-border)'}`,
                color: activeLevel === lv ? LEVEL_COLORS[lv] : 'var(--color-text-muted)',
              }}
            >{lv}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={exercise?.id}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Exercise card */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-blue)', marginBottom: '16px' }}>
                Question {exerciseIdx + 1} of {levelExercises.length}
              </p>

              {/* Source chips (read only) */}
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Scrambled words:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {exercise?.scrambled.map((w, i) => (
                  <span key={i} style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
                    color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600,
                  }}>{w}</span>
                ))}
              </div>

              {/* Drag area */}
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Your answer (drag to reorder):
              </p>
              {words && (
                <Reorder.Group axis="x" values={words} onReorder={checked ? undefined : setWords}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '56px', listStyle: 'none', padding: 0 }}
                >
                  {words.map((word, i) => (
                    <Reorder.Item key={word + i} value={word}
                      className={`word-chip ${checked ? (wordStatus[i] || '') : ''}`}
                      style={{ cursor: checked ? 'default' : 'grab' }}
                    >
                      {word}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {/* Correct answer shown */}
              {checked && !isCorrect && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.25)', borderRadius: 'var(--radius-md)' }}
                >
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-green)', marginBottom: '4px' }}>Correct Answer</p>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{exercise?.correct}</p>
                </motion.div>
              )}

              {/* Structure diagram (on correct) */}
              {isCorrect && exercise?.parts && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-green)', marginBottom: '8px' }}>🎉 Sentence Structure</p>
                  <div className="structure-diagram">
                    {exercise.parts.map((p, i) => (
                      <div key={i} className="diagram-part">
                        <div className="diagram-label">{p.label}</div>
                        <div className="diagram-word">"{p.word}"</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {!checked ? (
                <button className="btn-primary" onClick={handleCheck} style={{ flex: 1, justifyContent: 'center' }}>
                  ✅ Check Answer
                </button>
              ) : (
                <button className="btn-primary" onClick={handleNext} style={{ flex: 1, justifyContent: 'center', background: 'var(--gradient-green)' }}>
                  Next Question →
                </button>
              )}
              {!checked && (
                <button className="btn-secondary" onClick={() => initExercise(exercise)} style={{ padding: '12px 20px' }}>
                  🔀 Shuffle
                </button>
              )}
            </div>

            {/* AI Explanation */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <LoadingSpinner text="AI is analyzing your answer..." />
                </motion.div>
              )}
              {!loading && aiExplanation && (
                <motion.div className="ai-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="ai-panel-header">
                    <span style={{ fontSize: '20px' }}>🤖</span>
                    <span className="ai-panel-label">AI Coach Explanation</span>
                  </div>
                  <p className="ai-panel-text">{aiExplanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
