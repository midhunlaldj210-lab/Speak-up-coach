import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { getAIFeedback } from '../services/geminiService';
import { SAMPLE_TASKS } from '../firebase/seed';
import Navbar from '../components/Navbar';
import MicButton from '../components/MicButton';
import FeedbackPanel from '../components/FeedbackCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SessionSummary from '../components/SessionSummary';
import toast, { Toaster } from 'react-hot-toast';

const MAX_EXCHANGES = 4;

// Practice states
const STATE = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  FEEDBACK: 'feedback',
  COMPLETE: 'complete',
};

export default function PracticeScreen() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [practiceState, setPracticeState] = useState(STATE.IDLE);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [exchanges, setExchanges] = useState([]);    // { userSaid, aiReply }[]
  const [corrections, setCorrections] = useState([]); // { userSaid, correction, betterSentence }[]
  const [aiError, setAiError] = useState(null);

  const {
    transcript,
    interimTranscript,
    isListening,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, isSpeaking } = useSpeechSynthesis();

  // Load task from Firestore, fallback to seed data
  useEffect(() => {
    async function loadTask() {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        const snap = await getDoc(taskRef);
        if (snap.exists()) {
          setTask({ id: snap.id, ...snap.data() });
        } else {
          // Fallback to local seed data
          const localTask = SAMPLE_TASKS.find((t) => t.id === taskId);
          if (localTask) setTask(localTask);
          else { toast.error('Task not found.'); navigate('/dashboard'); }
        }
      } catch (err) {
        const localTask = SAMPLE_TASKS.find((t) => t.id === taskId);
        if (localTask) setTask(localTask);
        else { toast.error('Failed to load task.'); navigate('/dashboard'); }
      } finally {
        setTaskLoading(false);
      }
    }
    loadTask();
  }, [taskId, navigate]);

  // Auto-speak AI reply
  useEffect(() => {
    if (currentFeedback?.aiReply && practiceState === STATE.FEEDBACK) {
      const timer = setTimeout(() => {
        speak(currentFeedback.aiReply, { rate: 0.9 });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentFeedback, practiceState, speak]);

  // Save session to Firestore when complete
  useEffect(() => {
    if (practiceState === STATE.COMPLETE && exchanges.length > 0 && user && task) {
      saveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceState]);

  const saveSession = async () => {
    try {
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      await addDoc(sessionsRef, {
        taskTitle: task.title,
        taskId: task.id,
        taskLevel: task.level,
        date: serverTimestamp(),
        exchanges,
        corrections,
        exchangeCount: exchanges.length,
        correctionCount: corrections.filter(
          (c) => !c.correction?.toLowerCase().includes('no correction')
        ).length,
      });
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  // Use a ref so effects can call the latest version without stale closure issues
  const handleProcessSpeechRef = useRef(null);

  const handleProcessSpeech = useCallback(async (spokenText) => {
    if (!spokenText || spokenText.trim().length < 2) {
      toast.error('Please say something before submitting.');
      setPracticeState(STATE.IDLE);
      return;
    }

    setPracticeState(STATE.PROCESSING);
    setAiError(null);

    try {
      const feedback = await getAIFeedback(task.prompt, spokenText.trim());
      setCurrentFeedback(feedback);
      setPracticeState(STATE.FEEDBACK);

      const newExchange = { userSaid: spokenText.trim(), aiReply: feedback.aiReply };
      const newCorrection = {
        userSaid: spokenText.trim(),
        correction: feedback.correction,
        betterSentence: feedback.betterSentence,
        explanation: feedback.explanation,
      };

      setExchanges((prev) => [...prev, newExchange]);
      setCorrections((prev) => [...prev, newCorrection]);
    } catch (err) {
      setAiError(err.message || 'AI is unavailable right now. Please try again.');
      setPracticeState(STATE.IDLE);
      toast.error(err.message || 'AI is unavailable right now.');
    }
  }, [task]);

  // Keep ref in sync with latest callback
  useEffect(() => {
    handleProcessSpeechRef.current = handleProcessSpeech;
  }, [handleProcessSpeech]);

  const handleMicClick = useCallback(() => {
    if (!isSupported) {
      toast.error('Your browser does not support voice input. Please use Chrome.');
      return;
    }

    if (isListening) {
      stopListening();
      // Give a moment for the final transcript to settle, then call via ref
      setTimeout(() => {
        const currentTranscript = transcript || interimTranscript;
        if (currentTranscript) {
          handleProcessSpeechRef.current?.(currentTranscript);
        } else {
          toast.error('No speech detected. Please try again.');
          setPracticeState(STATE.IDLE);
        }
      }, 500);
    } else {
      setAiError(null);
      setCurrentFeedback(null);
      resetTranscript();
      setPracticeState(STATE.LISTENING);
      startListening();
    }
  }, [isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript]);

  // Auto-submit when speech recognition ends naturally
  useEffect(() => {
    if (!isListening && practiceState === STATE.LISTENING && transcript) {
      handleProcessSpeechRef.current?.(transcript);
    }
  }, [isListening, practiceState, transcript]);

  const handleSpeakAgain = () => {
    if (exchanges.length >= MAX_EXCHANGES) {
      setPracticeState(STATE.COMPLETE);
      return;
    }
    setCurrentFeedback(null);
    resetTranscript();
    setPracticeState(STATE.IDLE);
  };

  const handleFinishSession = () => {
    setPracticeState(STATE.COMPLETE);
  };

  const handleRestart = () => {
    setExchanges([]);
    setCorrections([]);
    setCurrentFeedback(null);
    setAiError(null);
    resetTranscript();
    setPracticeState(STATE.IDLE);
  };

  if (taskLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Navbar />
        <LoadingSpinner text="Loading your practice task..." />
      </div>
    );
  }

  if (practiceState === STATE.COMPLETE) {
    return (
      <SessionSummary
        taskTitle={task?.title}
        exchanges={exchanges}
        corrections={corrections}
        onRestart={handleRestart}
      />
    );
  }

  const isProcessing = practiceState === STATE.PROCESSING;
  const isFeedback = practiceState === STATE.FEEDBACK;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
        },
      }} />
      <div className="animated-bg" />
      <Navbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Task Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <button
              id="btn-back-dashboard"
              onClick={() => navigate('/dashboard')}
              className="btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
            >
              ← Back
            </button>
            <span className={`badge badge-${task?.level?.toLowerCase()}`}>{task?.level}</span>
            {/* Exchange progress */}
            <span style={{
              marginLeft: 'auto',
              color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              Exchange {exchanges.length}/{MAX_EXCHANGES}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '4px',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(exchanges.length / MAX_EXCHANGES) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background: 'var(--gradient-blue)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>

          <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '8px' }}>
            {task?.title}
          </h1>
        </motion.div>

        {/* Scenario / Task Prompt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(0, 201, 167, 0.05))',
            border: '1px solid rgba(10, 132, 255, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '3px',
            background: 'var(--gradient-blue)',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'rgba(10, 132, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>
              📋
            </div>
            <div>
              <p style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-accent-blue)',
                marginBottom: '8px',
              }}>
                Your Scenario
              </p>
              <p style={{
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
                lineHeight: 1.7,
                fontWeight: 500,
              }}>
                {task?.prompt}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Microphone Section */}
        {!isFeedback && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 24px',
              marginBottom: '24px',
            }}
          >
            {/* Browser unsupported warning */}
            {!isSupported && (
              <div style={{
                background: 'rgba(255, 159, 10, 0.1)',
                border: '1px solid rgba(255, 159, 10, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '24px',
                color: 'var(--color-accent-orange)',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}>
                ⚠️ Your browser does not support voice input. Please use Chrome.
              </div>
            )}

            {speechError && (
              <div style={{
                background: 'rgba(255, 69, 58, 0.1)',
                border: '1px solid rgba(255, 69, 58, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
                color: 'var(--color-accent-red)',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}>
                {speechError}
              </div>
            )}

            <MicButton
              isListening={isListening}
              isDisabled={!isSupported}
              onClick={handleMicClick}
            />

            {/* Transcript display */}
            {(transcript || interimTranscript) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '24px',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  maxWidth: '500px',
                  textAlign: 'center',
                }}
              >
                <p style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '8px',
                }}>
                  You said:
                </p>
                <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {transcript}
                  {interimTranscript && (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      {' '}{interimTranscript}
                    </span>
                  )}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '60px 24px',
              gap: '16px',
            }}
          >
            <LoadingSpinner text="AI is analyzing your speech..." />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
              Getting personalized feedback just for you ✨
            </p>
          </motion.div>
        )}

        {/* Feedback Section */}
        <AnimatePresence>
          {isFeedback && currentFeedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* What you said */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                marginBottom: '16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>🗣️</span>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '4px' }}>You said</p>
                  <p style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{transcript}</p>
                </div>
              </div>

              {/* TTS speaking indicator */}
              {isSpeaking && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  marginBottom: '12px',
                  background: 'rgba(0, 201, 167, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 201, 167, 0.2)',
                }}>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} style={{
                        width: '3px', height: '14px',
                        background: 'var(--color-accent-teal)',
                        borderRadius: '2px',
                        animation: `wave 0.6s ease-in-out infinite`,
                        animationDelay: `${d}s`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-teal)', fontWeight: 600 }}>
                    AI is speaking...
                  </span>
                </div>
              )}

              <FeedbackPanel feedback={currentFeedback} />

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                flexWrap: 'wrap',
              }}>
                {exchanges.length < MAX_EXCHANGES ? (
                  <button
                    id="btn-speak-again"
                    className="btn-primary"
                    onClick={handleSpeakAgain}
                    style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}
                  >
                    🎙️ Speak Again
                  </button>
                ) : null}

                <button
                  id="btn-finish-session"
                  className="btn-secondary"
                  onClick={handleFinishSession}
                  style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}
                >
                  ✅ Finish Session
                </button>
              </div>

              {exchanges.length >= MAX_EXCHANGES && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    color: 'var(--color-accent-teal)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginTop: '12px',
                  }}
                >
                  🎉 Great work! You've completed {MAX_EXCHANGES} exchanges. Click Finish Session to see your summary.
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Error */}
        {aiError && (
          <div style={{
            background: 'rgba(255, 69, 58, 0.08)',
            border: '1px solid rgba(255, 69, 58, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginTop: '16px',
            color: 'var(--color-accent-red)',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}>
            {aiError}
          </div>
        )}
      </main>
    </div>
  );
}
