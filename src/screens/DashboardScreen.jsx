import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { seedTasks } from '../firebase/seed';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast, { Toaster } from 'react-hot-toast';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const LEVEL_META = {
  Beginner: { icon: '🌱', desc: 'Start with everyday conversations', color: 'var(--color-accent-green)' },
  Intermediate: { icon: '🚀', desc: 'Build fluency and confidence', color: 'var(--color-accent-blue)' },
  Advanced: { icon: '⚡', desc: 'Master professional English', color: 'var(--color-accent-purple)' },
};

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('All');
  const [mainTab, setMainTab] = useState('learn'); // 'learn' or 'practice'

  useEffect(() => {
    async function loadTasks() {
      try {
        const tasksRef = collection(db, 'tasks');
        let snap = await getDocs(tasksRef);

        // Auto-seed if empty
        if (snap.empty) {
          toast.loading('Setting up your tasks...', { id: 'seed' });
          await seedTasks();
          snap = await getDocs(tasksRef);
          toast.success('Tasks ready!', { id: 'seed' });
        }

        const fetchedTasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTasks(fetchedTasks);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tasks. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const filteredTasks = activeLevel === 'All'
    ? tasks
    : tasks.filter((t) => t.level === activeLevel);

  const groupedTasks = LEVELS.reduce((acc, level) => {
    acc[level] = tasks.filter((t) => t.level === level);
    return acc;
  }, {});

  const firstName = userProfile?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Hero Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
              {greeting} 👋
            </p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: '10px' }}>
              Ready to practice,{' '}
              <span style={{
                background: 'var(--gradient-blue)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {firstName}?
              </span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Choose a task and start speaking. AI will give you instant feedback!
            </p>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              {
                label: 'Day Streak',
                value: userProfile?.streak || 0,
                icon: '🔥',
                color: 'var(--color-accent-orange)',
                bg: 'rgba(255, 159, 10, 0.1)',
                border: 'rgba(255, 159, 10, 0.2)',
              },
              {
                label: 'Tasks Available',
                value: tasks.length,
                icon: '📚',
                color: 'var(--color-accent-blue)',
                bg: 'rgba(10, 132, 255, 0.1)',
                border: 'rgba(10, 132, 255, 0.2)',
              },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '16px 20px',
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                minWidth: '100px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

          {/* Main Navigation Tabs */}
          <div className="dash-tabs">
            <button className={`dash-tab ${mainTab === 'learn' ? 'active' : ''}`} onClick={() => setMainTab('learn')}>
              🧠 Learn First
            </button>
            <button className={`dash-tab ${mainTab === 'practice' ? 'active' : ''}`} onClick={() => setMainTab('practice')}>
              🗣️ Practice Speaking
            </button>
            <button className="dash-tab" onClick={() => navigate('/masterclass')}
              style={{ background: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.25)', color: '#D4AF37' }}>
              🏆 Masterclass
            </button>
            <button className="dash-tab" onClick={() => navigate('/progress')}>
              📈 My Progress
            </button>
          </div>

        <AnimatePresence mode="wait">
          {mainTab === 'learn' ? (
            <motion.div key="learn" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              
              {/* Daily Goal */}
              <div className="daily-goal">
                <div>
                  <div className="daily-goal-title">Daily Goal</div>
                  <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Complete 1 module of each type</div>
                </div>
                <div className="goal-pills">
                  <div className="goal-pill done"><span className="goal-pill-check">✅</span> Grammar</div>
                  <div className="goal-pill"><span className="goal-pill-check">⭕</span> Vocabulary</div>
                  <div className="goal-pill"><span className="goal-pill-check">⭕</span> Speaking</div>
                </div>
              </div>

              {/* Learning Path Stepper */}
              <div className="learning-path">
                <div className="path-step">
                  <div className="path-step-icon done">🟢</div>
                  <div className="path-step-label">Vocabulary</div>
                </div>
                <div className="path-connector done"></div>
                <div className="path-step">
                  <div className="path-step-icon active">🟣</div>
                  <div className="path-step-label">Grammar</div>
                </div>
                <div className="path-connector"></div>
                <div className="path-step">
                  <div className="path-step-icon">🔵</div>
                  <div className="path-step-label">Sentence</div>
                </div>
                <div className="path-connector"></div>
                <div className="path-step">
                  <div className="path-step-icon">🟠</div>
                  <div className="path-step-label">Pronounce</div>
                </div>
                <div className="path-connector"></div>
                <div className="path-step" onClick={() => setMainTab('practice')} style={{ cursor: 'pointer' }}>
                  <div className="path-step-icon" style={{ borderColor: 'var(--color-border)' }}>🗣️</div>
                  <div className="path-step-label">Speak</div>
                </div>
              </div>

              {/* Module Cards */}
              <div className="module-cards">
                <div className="module-card module-green" onClick={() => navigate('/learn/vocabulary')}>
                  <div className="module-card-icon">🟢</div>
                  <h3 className="module-card-title">Vocabulary Builder</h3>
                  <p className="module-card-desc">Expand your word bank with fun matching games and Word of the Day.</p>
                  <div className="module-card-footer">
                    <span className="module-card-count">3 Mini Games</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                  </div>
                </div>

                <div className="module-card module-purple" onClick={() => navigate('/learn/grammar')}>
                  <div className="module-card-icon">🟣</div>
                  <h3 className="module-card-title">Grammar Trainer</h3>
                  <p className="module-card-desc">Master English rules with AI explanations for every mistake.</p>
                  <div className="module-card-footer">
                    <span className="module-card-count">10+ Topics</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                  </div>
                </div>

                <div className="module-card module-blue" onClick={() => navigate('/learn/sentence')}>
                  <div className="module-card-icon">🔵</div>
                  <h3 className="module-card-title">Sentence Structure</h3>
                  <p className="module-card-desc">Drag and drop words to build perfect sentences.</p>
                  <div className="module-card-footer">
                    <span className="module-card-count">All Levels</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                  </div>
                </div>

                <div className="module-card module-orange" onClick={() => navigate('/learn/pronunciation')}>
                  <div className="module-card-icon">🟠</div>
                  <h3 className="module-card-title">Pronunciation Coach</h3>
                  <p className="module-card-desc">Get a 0-100% score on how accurately you pronounce words.</p>
                  <div className="module-card-footer">
                    <span className="module-card-count">Live Feedback</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="practice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {/* Level Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '32px',
                  flexWrap: 'wrap',
                }}
              >
                {['All', ...LEVELS].map((level) => (
                  <button
                    key={level}
                    id={`btn-filter-${level.toLowerCase()}`}
                    onClick={() => setActiveLevel(level)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: activeLevel === level ? 'white' : 'var(--color-text-secondary)',
                      background: activeLevel === level
                        ? 'var(--gradient-blue)'
                        : 'rgba(255,255,255,0.05)',
                      border: activeLevel === level
                        ? '1px solid transparent'
                        : '1px solid var(--color-border)',
                      transition: 'all 0.2s ease',
                      boxShadow: activeLevel === level ? 'var(--shadow-glow-blue)' : 'none',
                    }}
                  >
                    {level === 'Beginner' ? '🌱 ' : level === 'Intermediate' ? '🚀 ' : level === 'Advanced' ? '⚡ ' : ''}
                    {level}
                  </button>
                ))}
              </div>

              {/* Tasks Content */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                  <LoadingSpinner text="Loading your practice tasks..." />
                </div>
              ) : activeLevel === 'All' ? (
                /* Grouped view */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                  {LEVELS.map((level) => {
                    const levelTasks = groupedTasks[level] || [];
                    if (levelTasks.length === 0) return null;
                    const meta = LEVEL_META[level];

                    return (
                      <section key={level}>
                        {/* Section Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '20px',
                          paddingBottom: '16px',
                          borderBottom: '1px solid var(--color-border)',
                        }}>
                          <span style={{ fontSize: '24px' }}>{meta.icon}</span>
                          <div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '2px', color: meta.color }}>{level}</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{meta.desc}</p>
                          </div>
                          <span style={{
                            marginLeft: 'auto',
                            padding: '4px 12px',
                            background: `${meta.color}15`,
                            color: meta.color,
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            {levelTasks.length} tasks
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '16px',
                        }}>
                          {levelTasks.map((task, idx) => (
                            <TaskCard key={task.id} task={task} index={idx} />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                /* Filtered view */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}>
                  {filteredTasks.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px 0' }}>
                      No tasks available for this level yet.
                    </p>
                  ) : filteredTasks.map((task, idx) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
