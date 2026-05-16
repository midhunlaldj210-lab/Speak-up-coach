import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getCertificate } from '../firebase/masterclassService';
import '../masterclass.css';

export default function CertificateScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef(null);

  useEffect(() => {
    if (user) {
      getCertificate(user.uid)
        .then(c => { setCert(c); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handlePrint = () => window.print();

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(`I just completed the "Speak with Confidence & Clarity — 6 Week Masterclass" on SpeakUp Coach AI! 🎓🏆\n\nCertificate ID: ${cert?.certificateId}\n\n#PublicSpeaking #Communication #SpeakUp #ProfessionalDevelopment`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://speakupcoach.vercel.app')}&summary=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="mc-page">
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <LoadingSpinner text="Loading your certificate..." />
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="mc-page">
        <Navbar />
        <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ color: '#D4AF37', marginBottom: '12px' }}>Certificate Not Yet Earned</h2>
          <p style={{ color: '#8892A4', marginBottom: '24px', lineHeight: 1.6 }}>
            Complete all 6 modules, pass all quizzes with 60%+, and score 70+ on your final capstone speech to earn your certificate.
          </p>
          <button className="mc-btn-gold" onClick={() => navigate('/masterclass')}>
            ← Go to Masterclass
          </button>
        </div>
      </div>
    );
  }

  const issuedDate = cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today';

  return (
    <div className="mc-cert-page">
      <div className="mc-cert-wrap">

        {/* Action Buttons */}
        <div className="mc-cert-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button className="mc-btn-outline" onClick={() => navigate('/masterclass')}>← Masterclass</button>
          <button className="mc-btn-outline" onClick={handlePrint}>🖨️ Download PDF</button>
          <button className="mc-btn-gold" onClick={handleShareLinkedIn}>🔗 Share on LinkedIn</button>
        </div>

        {/* Certificate */}
        <motion.div ref={certRef} className="mc-certificate" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          {/* Corner decorations */}
          <div className="mc-cert-corner tl" />
          <div className="mc-cert-corner tr" />
          <div className="mc-cert-corner bl" />
          <div className="mc-cert-corner br" />

          {/* Header */}
          <div className="mc-cert-logo">🎙️</div>
          <div className="mc-cert-issuer">SpeakUp Coach AI</div>

          {/* Stars */}
          <div style={{ fontSize: '1.2rem', letterSpacing: '8px', marginBottom: '24px', opacity: 0.6 }}>✦ ✦ ✦</div>

          <div className="mc-cert-of">Certificate of Completion</div>
          <div className="mc-cert-title">Speak with Confidence<br />& Clarity</div>

          <div style={{ fontSize: '0.8rem', color: '#8892A4', marginBottom: '24px', fontStyle: 'italic' }}>
            6-Week Masterclass in Communication Excellence
          </div>

          <div className="mc-cert-presented">This certificate is proudly presented to</div>
          <div className="mc-cert-name">{cert.userName}</div>

          <div className="mc-cert-course">
            For successfully completing all 6 modules, passing all assessments,<br />
            and demonstrating excellence in the Final Capstone Speech exercise.
          </div>

          {/* Score display */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '999px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '28px' }}>
            <span style={{ color: '#D4AF37', fontWeight: 700 }}>Final Score:</span>
            <span style={{ color: '#FFD700', fontWeight: 800, fontSize: '1.1rem' }}>{cert.finalScore}/100</span>
          </div>

          {/* Meta */}
          <div className="mc-cert-meta">
            <div className="mc-cert-meta-item">
              <div className="mc-cert-meta-label">Issued On</div>
              <div className="mc-cert-meta-value">{issuedDate}</div>
            </div>
            <div className="mc-cert-meta-item">
              <div className="mc-cert-meta-label">Certificate ID</div>
              <div className="mc-cert-meta-value">{cert.certificateId}</div>
            </div>
            <div className="mc-cert-meta-item">
              <div className="mc-cert-meta-label">Duration</div>
              <div className="mc-cert-meta-value">6 Weeks</div>
            </div>
          </div>

          {/* Signature */}
          <div className="mc-cert-sig">
            <div style={{ fontSize: '1.4rem', fontStyle: 'italic', color: '#D4AF37', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>SpeakUp AI</div>
            <div>Powered by SpeakUp Coach AI · Verified with Gemini</div>
          </div>
        </motion.div>

        {/* Bottom message */}
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#8892A4', fontSize: '0.85rem' }}>
          🎉 Congratulations! You have joined the top communicators who speak with confidence and clarity.
        </div>
      </div>
    </div>
  );
}
