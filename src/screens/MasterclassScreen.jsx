import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getMasterclassProgress } from '../firebase/masterclassService';
import { MASTERCLASS_MODULES, WHO_IS_THIS_FOR } from '../firebase/masterclassData';
import '../masterclass.css';

function calcModuleProgress(mp, moduleId) {
  const key = `module${moduleId}`;
  const m = mp?.[key];
  if (!m) return 0;
  if (m.completed) return 100;
  const lessons = (m.lessonsRead || []).length;
  const exercises = (m.exercisesDone || []).length;
  const quiz = m.quizScore !== null ? 1 : 0;
  return Math.round(((lessons + exercises + quiz) / 7) * 100);
}

export default function MasterclassScreen() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMasterclassProgress(user.uid)
        .then(p => { setProgress(p); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const mp = progress?.moduleProgress || {};
  const overallPct = progress?.overallProgress || 0;
  const enrolledDate = progress?.enrolledDate ? new Date(progress.enrolledDate) : null;
  const daysSince = enrolledDate ? Math.floor((new Date() - enrolledDate) / 86400000) : 0;

  const handleModuleClick = (mod) => {
    const key = `module${mod.id}`;
    if (!mp[key]?.unlocked) return;
    navigate(`/masterclass/module/${mod.id}`);
  };

  const handleContinue = () => {
    const currentMod = progress?.currentModule || 1;
    navigate(`/masterclass/module/${currentMod}`);
  };

  if (loading) {
    return (
      <div className="mc-page">
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <LoadingSpinner text="Loading your masterclass..." />
        </div>
      </div>
    );
  }

  return (
    <div className="mc-page">
      <div className="mc-lesson-reading-bar">
        <div className="mc-lesson-reading-bar-fill" style={{ width: `${overallPct}%` }} />
      </div>
      <Navbar />

      {/* Hero */}
      <div className="mc-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mc-hero-badge">✦ 6-Week Masterclass</div>
          <h1 className="mc-hero-title">Speak with Confidence<br />& Clarity in 6 Weeks</h1>
          <p className="mc-hero-sub">A structured masterclass to transform how you communicate — with lessons, AI exercises, and a verified certificate.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="mc-btn-gold" onClick={handleContinue}>
              {overallPct > 0 ? '▶ Continue Where You Left Off' : '🚀 Start the Masterclass'}
            </button>
            {overallPct > 0 && progress?.certificateEarned && (
              <button className="mc-btn-outline" onClick={() => navigate('/masterclass/certificate')}>
                🏆 View Certificate
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mc-container">

        {/* Progress */}
        <motion.div className="mc-progress-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="mc-progress-label">
            <span>Week {Math.ceil((overallPct / 100) * 6) || 1} of 6 — Overall Progress</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {daysSince > 0 && <div className="mc-streak">🔥 Day {daysSince}</div>}
              <span className="mc-progress-pct">{overallPct}%</span>
            </div>
          </div>
          <div className="mc-progress-bar-bg">
            <div className="mc-progress-bar-fill" style={{ width: `${overallPct}%` }} />
          </div>
        </motion.div>

        {/* Who Is This For */}
        <div className="mc-section-title">Who Is This For?</div>
        <div className="mc-who-grid">
          {WHO_IS_THIS_FOR.map((w, i) => (
            <motion.div key={i} className="mc-who-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <div className="mc-who-icon">{w.icon}</div>
              <div className="mc-who-title">{w.title}</div>
              <div className="mc-who-desc">{w.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="mc-section-title">Your 6-Week Journey</div>
        <div className="mc-modules-grid">
          {MASTERCLASS_MODULES.map((mod, i) => {
            const key = `module${mod.id}`;
            const modData = mp[key] || {};
            const isLocked = !modData.unlocked;
            const isCompleted = modData.completed;
            const modPct = calcModuleProgress(mp, mod.id);

            return (
              <motion.div
                key={mod.id}
                className={`mc-module-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleModuleClick(mod)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                style={{ borderTopColor: isCompleted ? '#34D399' : isLocked ? 'transparent' : mod.color }}
              >
                <div style={{ borderTop: `3px solid ${isCompleted ? '#34D399' : isLocked ? 'transparent' : mod.color}`, margin: '-24px -24px 20px', borderRadius: '20px 20px 0 0' }} />
                <div className="mc-module-num">
                  {mod.icon} Module {mod.id} {isLocked ? '🔒' : isCompleted ? '✅' : ''}
                </div>
                <div className="mc-module-title">{mod.title}</div>
                <div className="mc-module-sub">{mod.subtitle}</div>
                <ul className="mc-module-bullets">
                  {mod.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
                <div className="mc-module-progress-bar">
                  <div className="mc-module-progress-fill" style={{ width: `${modPct}%` }} />
                </div>
                <div className="mc-module-status">
                  <span style={{ color: isLocked ? '#4a5568' : modPct > 0 ? mod.color : '#8892A4', fontSize: '0.78rem' }}>
                    {isLocked ? `Unlocks Day ${mod.unlockDay}` : isCompleted ? '✅ Completed' : modPct > 0 ? `${modPct}% complete` : 'Not started'}
                  </span>
                  {!isLocked && (
                    <span style={{ color: mod.color, fontWeight: 700, fontSize: '0.85rem' }}>
                      {isCompleted ? 'Review →' : 'Continue →'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Certificate Preview */}
        <div className="mc-section-title">Certificate of Completion</div>
        <div className="mc-cert-locked-wrap">
          <div className="mc-cert-preview-locked">
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', marginBottom: '8px' }}>Certificate of Completion</div>
            <div style={{ color: '#8892A4', fontSize: '0.9rem' }}>Speak with Confidence & Clarity — 6 Week Masterclass</div>
            <div style={{ marginTop: '16px', color: '#D4AF37', fontSize: '0.8rem' }}>SPK-2025-XXXXX</div>
          </div>
          {overallPct < 100 && (
            <div className="mc-cert-overlay">
              <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</span>
              <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}>Complete all 6 modules to unlock</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
