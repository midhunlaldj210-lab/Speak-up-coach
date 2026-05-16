import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { GRAMMAR_QUESTIONS } from '../firebase/learningData';
import { getGrammarFeedback } from '../services/geminiService';
import { useConfetti, playSound } from '../hooks/useConfettiSound';
import '../learning.css';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const CATEGORIES = ['All', ...new Set(GRAMMAR_QUESTIONS.map(q => q.category))];

export default function GrammarTrainerScreen() {
  const { launchConfetti } = useConfetti();
  const [category, setCategory]         = useState('All');
  const [questionIdx, setQuestionIdx]   = useState(0);
  const [selected, setSelected]         = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading]           = useState(false);
  const [score, setScore]               = useState({ correct: 0, total: 0 });

  const questions = useMemo(() =>
    category === 'All' ? GRAMMAR_QUESTIONS : GRAMMAR_QUESTIONS.filter(q => q.category === category),
  [category]);
  const question = questions[questionIdx % questions.length];

  const handleSelect = async (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const isCorrect = optIdx === question.correct;
    if (isCorrect) { playSound('correct'); launchConfetti(isCorrect && score.correct + 1 === questions.length ? 70 : 20); setScore(s => ({ correct: s.correct + 1, total: s.total + 1 })); }
    else { playSound('wrong'); setScore(s => ({ ...s, total: s.total + 1 })); }
    setLoading(true);
    try {
      const exp = await getGrammarFeedback(question.sentence, question.options, question.correct, optIdx);
      setAiExplanation(exp);
    } catch {
      setAiExplanation(isCorrect
        ? `Correct! "${question.options[question.correct]}" is right here.`
        : `The correct answer is "${question.options[question.correct]}".`);
    } finally { setLoading(false); }
  };

  const handleNext = () => { setQuestionIdx(i => (i + 1) % questions.length); setSelected(null); setAiExplanation(''); };
  const handleCategoryChange = (cat) => { setCategory(cat); setQuestionIdx(0); setSelected(null); setAiExplanation(''); setScore({ correct: 0, total: 0 }); };
  const getOptionClass = (idx) => {
    if (selected === null) return 'grammar-option';
    if (idx === question.correct) return 'grammar-option correct';
    if (idx === selected && idx !== question.correct) return 'grammar-option wrong';
    return 'grammar-option';
  };
  const accuracy = score.total === 0 ? 0 : Math.round((score.correct / score.total) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="animated-bg" />
      <Navbar />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '28px' }}>🟣</span>
            <h1 style={{ fontSize: '1.5rem', flex: 1 }}>Grammar Trainer</h1>
            <div style={{ background: 'rgba(191,90,242,0.1)', border: '1px solid rgba(191,90,242,0.25)', color: 'var(--color-accent-purple)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
              🎯 {score.correct}/{score.total} · {accuracy}%
            </div>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '6px' }}>Pick the correct answer — AI will explain why</p>
        </motion.div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)}
              style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: category === cat ? 'rgba(191,90,242,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${category === cat ? 'rgba(191,90,242,0.35)' : 'var(--color-border)'}`,
                color: category === cat ? 'var(--color-accent-purple)' : 'var(--color-text-muted)',
              }}>{cat}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={question?.id}
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}
          >
            <div className="glass-card" style={{ padding: '28px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(191,90,242,0.12)', color: 'var(--color-accent-purple)' }}>
                  {question?.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Q{questionIdx + 1} of {questions.length}</span>
              </div>
              <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '28px' }}>{question?.sentence}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {question?.options.map((opt, idx) => (
                  <button key={idx} className={getOptionClass(idx)} onClick={() => handleSelect(idx)} disabled={selected !== null}>
                    <span className="option-label">{OPTION_LABELS[idx]}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {selected !== null && idx === question.correct && <span>✅</span>}
                    {selected === idx && idx !== question.correct && <span>❌</span>}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><LoadingSpinner text="AI explaining grammar rule..." /></motion.div>}
              {!loading && aiExplanation && (
                <motion.div className="ai-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="ai-panel-header">
                    <span style={{ fontSize: '20px' }}>🤖</span>
                    <span className="ai-panel-label">Grammar Explanation</span>
                  </div>
                  <p className="ai-panel-text">{aiExplanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {selected !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px' }}>
                <button className="btn-primary" onClick={handleNext} style={{ width: '100%', justifyContent: 'center', background: 'var(--gradient-purple)' }}>
                  Next Question →
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
