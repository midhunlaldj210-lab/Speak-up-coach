import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { MASTERCLASS_MODULES } from '../firebase/masterclassData';
import {
  getMasterclassProgress, markLessonRead,
  markExerciseDone, saveQuizScore, issueCertificate
} from '../firebase/masterclassService';
import {
  getMasterclassExerciseQuestion, getMasterclassExerciseFeedback,
  getMasterclassQuiz, evaluateCapstone
} from '../services/geminiService';
import '../masterclass.css';

/* ─── Reading Progress Hook ── */
function useReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scroll = el.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setPct(height > 0 ? Math.round((scroll / height) * 100) : 0);
    };
    window.addEventListener('scroll', update);
    return () => window.removeEventListener('scroll', update);
  }, []);
  return pct;
}

/* ─── Lesson Component ── */
function LessonCard({ lesson, moduleId, isRead, onMarkRead }) {
  return (
    <motion.div className="mc-lesson-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mc-lesson-title">📖 Lesson {lesson.id} — {lesson.title}</div>
      <div className="mc-lesson-content">{lesson.content}</div>
      <button
        className={`mc-mark-read-btn ${isRead ? 'done' : ''}`}
        onClick={() => !isRead && onMarkRead(lesson.id)}
        disabled={isRead}
      >
        {isRead ? '✅ Lesson Complete' : '✓ Mark as Read'}
      </button>
    </motion.div>
  );
}

/* ─── Exercise Component ── */
function ExerciseCard({ lesson, moduleId, exerciseId, isDone, onDone }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | asked | answered

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const q = await getMasterclassExerciseQuestion(lesson.exercisePrompt);
      setQuestion(q);
      setPhase('asked');
    } catch { setQuestion('Reflect on the lesson. Write 2-3 sentences about how this applies to your own communication style.'); setPhase('asked'); }
    finally { setLoading(false); }
  }, [lesson.exercisePrompt]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const fb = await getMasterclassExerciseFeedback(lesson.exercisePrompt, answer);
      setFeedback(fb);
      setPhase('answered');
      onDone(exerciseId);
    } catch { setFeedback('Great reflection! Keep practicing this insight in your daily communication.'); setPhase('answered'); onDone(exerciseId); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="mc-exercise-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mc-exercise-header">
        <span style={{ fontSize: '1.2rem' }}>🤖</span>
        <span className="mc-exercise-label">AI Exercise — After Lesson {lesson.id}</span>
        {isDone && <span style={{ marginLeft: 'auto', color: '#34D399', fontSize: '0.8rem', fontWeight: 700 }}>✅ Done</span>}
      </div>

      {phase === 'idle' && !isDone && (
        <button className="mc-btn-gold" onClick={loadQuestion} disabled={loading} style={{ fontSize: '0.85rem', padding: '12px 24px' }}>
          {loading ? '...' : '▶ Start Exercise'}
        </button>
      )}

      {isDone && phase === 'idle' && (
        <div style={{ color: '#8892A4', fontSize: '0.88rem' }}>You completed this exercise. Move to the next lesson.</div>
      )}

      <div className="mc-chat-area">
        {question && (
          <motion.div className="mc-chat-bubble mc-chat-ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {question}
          </motion.div>
        )}

        {phase === 'asked' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <textarea
              className="mc-exercise-input"
              placeholder="Type your response here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={4}
              style={{ marginTop: '12px', marginBottom: '10px' }}
            />
            <button className="mc-btn-gold" onClick={handleSubmit} disabled={loading || !answer.trim()} style={{ fontSize: '0.85rem', padding: '12px 24px' }}>
              {loading ? '🤔 Analyzing...' : 'Submit →'}
            </button>
          </motion.div>
        )}

        {answer && phase === 'answered' && (
          <div className="mc-chat-bubble mc-chat-user">{answer}</div>
        )}

        {feedback && (
          <motion.div className="mc-chat-feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            🤖 <strong>Coach:</strong> {feedback}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Quiz Component ── */
function QuizSection({ module, onPassed }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [error, setError] = useState(null);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = await getMasterclassQuiz(module.quizTopic);
      setQuestions(q);
    } catch (err) { 
      setError('Failed to generate quiz. The AI might be busy, please try again.');
    }
    finally { setLoading(false); }
  };

  const handleAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onPassed(pct);
  };

  if (!questions && !loading) {
    return (
      <div className="mc-quiz-card">
        <div className="mc-quiz-title">📝 Module {module.id} Quiz</div>
        <p style={{ color: '#8892A4', fontSize: '0.88rem', marginBottom: '16px' }}>Test your understanding of this module with 5 AI-generated questions.</p>
        
        {error && (
          <div style={{ color: '#F87171', background: 'rgba(248,113,113,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', border: '1px solid rgba(248,113,113,0.3)' }}>
            ⚠️ {error}
          </div>
        )}

        <button className="mc-btn-gold" onClick={loadQuiz} style={{ fontSize: '0.85rem', padding: '12px 24px' }}>
          Generate Quiz
        </button>
      </div>
    );
  }

  if (loading) return <div className="mc-quiz-card"><LoadingSpinner text="Generating quiz questions..." /></div>;

  return (
    <div>
      {questions?.map((q, qi) => (
        <motion.div key={qi} className="mc-quiz-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.1 }}>
          <div className="mc-quiz-title">Question {qi + 1} of {questions.length}</div>
          <div className="mc-quiz-question">{q.question}</div>
          {q.options.map((opt, oi) => {
            const isSelected = answers[qi] === oi;
            const isCorrect = submitted && oi === q.correct;
            const isWrong = submitted && isSelected && oi !== q.correct;
            return (
              <button
                key={oi}
                className={`mc-quiz-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleAnswer(qi, oi)}
                disabled={submitted}
                style={{ background: isSelected && !submitted ? 'rgba(212,175,55,0.1)' : '', borderColor: isSelected && !submitted ? '#D4AF37' : '' }}
              >
                <strong>{['A','B','C','D'][oi]}.</strong> {opt}
              </button>
            );
          })}
          {submitted && (
            <div className="mc-quiz-explanation">
              💡 {q.explanation}
            </div>
          )}
        </motion.div>
      ))}

      {questions && !submitted && (
        <button
          className="mc-btn-gold"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          style={{ width: '100%', justifyContent: 'center', marginBottom: '24px' }}
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <motion.div className="mc-quiz-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', background: score >= 60 ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)', borderColor: score >= 60 ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: score >= 60 ? '#34D399' : '#F87171' }}>{score}%</div>
          <div style={{ color: '#8892A4', marginTop: '4px', fontSize: '0.88rem' }}>
            {score >= 60 ? '🎉 Passed! You can now complete this module.' : '⚠️ Score below 60%. Review the lessons and try again.'}
          </div>
          {score < 60 && (
            <button className="mc-btn-outline" onClick={() => { setQuestions(null); setAnswers({}); setSubmitted(false); }} style={{ marginTop: '16px' }}>
              🔄 Retake Quiz
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── Capstone Component (Module 6 Final Exercise) ── */
function CapstoneExercise({ uid, userName, onCertificateEarned }) {
  const [speech, setSpeech] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    if (speech.trim().split(/\s+/).length < 50) {
      alert('Please write at least 50 words for your capstone speech.');
      return;
    }
    setLoading(true);
    try {
      const r = await evaluateCapstone(speech);
      setResult(r);
      if (r.certificateEligible) {
        await issueCertificate(uid, userName, r.total);
        onCertificateEarned(r.total);
      }
    } catch { alert('Could not evaluate speech. Please try again.'); }
    finally { setLoading(false); }
  };

  const scoreItems = result ? [
    { label: 'Opening Strength', val: result.scores.opening, fb: result.feedback.opening },
    { label: 'Structure & Flow', val: result.scores.structure, fb: result.feedback.structure },
    { label: 'Personal Story', val: result.scores.storytelling, fb: result.feedback.storytelling },
    { label: 'Word Choice', val: result.scores.vocabulary, fb: result.feedback.vocabulary },
    { label: 'Closing Impact', val: result.scores.closing, fb: result.feedback.closing },
  ] : [];

  return (
    <motion.div className="mc-exercise-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mc-exercise-header">
        <span style={{ fontSize: '1.4rem' }}>🏆</span>
        <span className="mc-exercise-label">Final Capstone Speech</span>
      </div>

      <div style={{ background: 'rgba(212,175,55,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.88rem', color: '#D4AF37', fontWeight: 700, marginBottom: '8px' }}>Your topic:</p>
        <p style={{ fontSize: '0.95rem', color: '#F8F9FF', lineHeight: 1.6 }}>
          "The one thing I have learned about communication that will change how I speak forever."
        </p>
        <p style={{ fontSize: '0.8rem', color: '#8892A4', marginTop: '12px' }}>
          Requirements: Strong opening • Crisis-Hope structure • Personal story • Powerful closing<br />
          Length: 250–300 words • Scored out of 100 • Need 70+ for certificate
        </p>
      </div>

      {!result && (
        <>
          <textarea
            className="mc-exercise-input"
            placeholder="Write your capstone speech here (250-300 words)..."
            value={speech}
            onChange={e => setSpeech(e.target.value)}
            rows={10}
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#8892A4' }}>{speech.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <button className="mc-btn-gold" onClick={handleEvaluate} disabled={loading || speech.trim().length < 100} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? '🤔 Evaluating your speech...' : '📊 Submit for Evaluation'}
          </button>
        </>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mc-capstone-score">
            <div className="mc-capstone-total">{result.total}/100</div>
            <div style={{ color: result.certificateEligible ? '#34D399' : '#F87171', fontWeight: 700, marginBottom: '16px' }}>
              {result.certificateEligible ? '🎉 Certificate Eligible!' : '📝 Keep Refining — You Need 70+'}
            </div>
            <div className="mc-score-criteria">
              {scoreItems.map((s, i) => (
                <div key={i} className="mc-score-item">
                  <div className="mc-score-item-label">{s.label}</div>
                  <div className="mc-score-item-val">{s.val}/20</div>
                  <div style={{ fontSize: '0.75rem', color: '#8892A4', marginTop: '4px', lineHeight: 1.5 }}>{s.fb}</div>
                </div>
              ))}
            </div>
            <div style={{ color: '#8892A4', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '16px' }}>{result.overallComment}</div>
            {!result.certificateEligible && (
              <button className="mc-btn-outline" onClick={() => { setResult(null); }}>
                ✏️ Rewrite & Resubmit
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Main Module Screen ── */
export default function ModuleScreen() {
  const { id } = useParams();
  const moduleId = parseInt(id);
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);
  const [certEarned, setCertEarned] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const readingPct = useReadingProgress();

  const mod = MASTERCLASS_MODULES.find(m => m.id === moduleId);

  const loadProgress = useCallback(async () => {
    if (user) {
      const p = await getMasterclassProgress(user.uid);
      setProgress(p);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  if (!mod) return <div className="mc-page"><Navbar /><div style={{ padding: '80px', textAlign: 'center', color: '#8892A4' }}>Module not found.</div></div>;

  const key = `module${moduleId}`;
  const mp = progress?.moduleProgress?.[key] || {};
  const lessonsRead = mp.lessonsRead || [];
  const exercisesDone = mp.exercisesDone || [];
  const quizScore = mp.quizScore;

  // Steps: [lesson1, exercise1, lesson2, exercise2, lesson3, exercise3, quiz]
  // For module 6: add capstone after quiz
  const totalSteps = mod.id === 6 ? mod.lessons.length * 2 + 2 : mod.lessons.length * 2 + 1;
  const steps = [];
  mod.lessons.forEach((l, i) => {
    steps.push({ type: 'lesson', lesson: l, idx: i });
    steps.push({ type: 'exercise', lesson: l, exerciseId: `ex${l.id}`, idx: i });
  });
  steps.push({ type: 'quiz' });
  if (mod.id === 6) steps.push({ type: 'capstone' });

  const handleMarkRead = async (lessonId) => {
    await markLessonRead(user.uid, moduleId, lessonId);
    await loadProgress();
    setActiveStep(s => Math.min(s + 1, steps.length - 1));
  };

  const handleExerciseDone = async (exerciseId) => {
    await markExerciseDone(user.uid, moduleId, exerciseId);
    await loadProgress();
    setTimeout(() => setActiveStep(s => Math.min(s + 1, steps.length - 1)), 1200);
  };

  const handleQuizPassed = async (score) => {
    const passed = await saveQuizScore(user.uid, moduleId, score);
    if (passed) {
      setQuizPassed(true);
      await loadProgress();
    }
  };

  const handleCertEarned = (score) => {
    setCertEarned(true);
    setTimeout(() => navigate('/masterclass/certificate'), 2000);
  };

  const stepLabels = [];
  mod.lessons.forEach((l, i) => {
    stepLabels.push(`L${i + 1}`);
    stepLabels.push(`E${i + 1}`);
  });
  stepLabels.push('Quiz');
  if (mod.id === 6) stepLabels.push('Final');

  const isDoneStep = (sIdx) => {
    const s = steps[sIdx];
    if (!s) return false;
    if (s.type === 'lesson') return lessonsRead.includes(s.lesson.id);
    if (s.type === 'exercise') return exercisesDone.includes(s.exerciseId);
    if (s.type === 'quiz') return quizScore !== null;
    if (s.type === 'capstone') return certEarned;
    return false;
  };

  if (loading) {
    return <div className="mc-page"><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}><LoadingSpinner /></div></div>;
  }

  const currentStep = steps[activeStep];

  return (
    <div className="mc-module-page">
      <div className="mc-lesson-reading-bar">
        <div className="mc-lesson-reading-bar-fill" style={{ width: `${readingPct}%` }} />
      </div>
      <Navbar />
      <div className="mc-container">

        {/* Back */}
        <button className="mc-back-btn" onClick={() => navigate('/masterclass')}>← Back to Masterclass</button>

        {/* Module Header */}
        <div className="mc-module-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem' }}>{mod.icon}</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Module {mod.id}</div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: mod.color, margin: 0 }}>{mod.title}</h1>
            </div>
          </div>
          <p style={{ color: '#8892A4', fontSize: '0.9rem', margin: 0 }}>{mod.subtitle}</p>
        </div>

        {/* Step Navigator */}
        <div className="mc-steps">
          {stepLabels.map((label, i) => (
            <div
              key={i}
              className={`mc-step ${activeStep === i ? 'active' : ''} ${isDoneStep(i) ? 'done' : ''}`}
              onClick={() => setActiveStep(i)}
            >
              <div className="mc-step-dot">{isDoneStep(i) ? '✓' : label}</div>
              <div className="mc-step-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {currentStep?.type === 'lesson' && (
              <LessonCard
                lesson={currentStep.lesson}
                moduleId={moduleId}
                isRead={lessonsRead.includes(currentStep.lesson.id)}
                onMarkRead={handleMarkRead}
              />
            )}
            {currentStep?.type === 'exercise' && (
              <ExerciseCard
                lesson={currentStep.lesson}
                moduleId={moduleId}
                exerciseId={currentStep.exerciseId}
                isDone={exercisesDone.includes(currentStep.exerciseId)}
                onDone={handleExerciseDone}
              />
            )}
            {currentStep?.type === 'quiz' && (
              <QuizSection module={mod} onPassed={handleQuizPassed} />
            )}
            {currentStep?.type === 'capstone' && (
              <CapstoneExercise
                uid={user?.uid}
                userName={userProfile?.displayName || user?.email || 'Student'}
                onCertificateEarned={handleCertEarned}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {activeStep > 0 && (
            <button className="mc-btn-outline" onClick={() => setActiveStep(s => s - 1)}>← Previous</button>
          )}
          {activeStep < steps.length - 1 && (
            <button className="mc-btn-gold" onClick={() => setActiveStep(s => s + 1)} style={{ marginLeft: 'auto' }}>
              Next →
            </button>
          )}
          {activeStep === steps.length - 1 && quizPassed && mod.id < 6 && (
            <button className="mc-btn-gold" onClick={() => navigate('/masterclass')} style={{ marginLeft: 'auto' }}>
              🏠 Back to Masterclass
            </button>
          )}
        </div>

        {/* Certificate earned toast */}
        {certEarned && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: 'var(--mc-gradient-gold)', color: '#0a0e1a', padding: '16px 32px', borderRadius: '999px', fontWeight: 800, fontSize: '1rem', zIndex: 999, boxShadow: '0 8px 32px rgba(212,175,55,0.5)' }}>
            🏆 Certificate Earned! Redirecting...
          </motion.div>
        )}

      </div>
    </div>
  );
}
