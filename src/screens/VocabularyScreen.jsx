import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { WORD_MATCH_SETS, FILL_STORIES } from '../firebase/learningData';
import { getWordOfTheDay, getVocabMatchFeedback } from '../services/geminiService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useConfetti, playSound } from '../hooks/useConfettiSound';
import '../learning.css';

const GAMES = ['Word Match', 'Fill the Story', 'Word of the Day'];

export default function VocabularyScreen() {
  const { launchConfetti } = useConfetti();
  const [game, setGame] = useState('Word Match');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)' }}>
      <div className="animated-bg" />
      <Navbar />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🟢</span>
            <h1 style={{ fontSize: '1.5rem' }}>Vocabulary Builder</h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '6px' }}>Three fun games to grow your vocabulary</p>
        </motion.div>

        <div className="vocab-game-tabs">
          {GAMES.map(g => (
            <button key={g} className={`vocab-tab ${game === g ? 'active' : ''}`} onClick={() => setGame(g)}>{g}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={game} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {game === 'Word Match'      && <WordMatch launchConfetti={launchConfetti} />}
            {game === 'Fill the Story' && <FillStory launchConfetti={launchConfetti} />}
            {game === 'Word of the Day'&& <WordOfDay launchConfetti={launchConfetti} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─── GAME 1: Word Match ─────────────────────────────────────── */
function WordMatch({ launchConfetti }) {
  const setIdx = 0;
  const set = WORD_MATCH_SETS[setIdx];
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState({});
  const [shuffledDefs] = useState(() => [...set.pairs].sort(() => Math.random() - 0.5));
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const allMatched = Object.keys(matches).length === set.pairs.length;

  const handleWordClick = (word) => {
    if (matches[word]) return;
    setSelectedWord(word);
    playSound('chime');
  };

  const handleDefClick = (def) => {
    if (!selectedWord) return;
    const correct = set.pairs.find(p => p.word === selectedWord)?.def === def;
    if (correct) {
      playSound('correct');
      setMatches(m => ({ ...m, [selectedWord]: def }));
      setSelectedWord(null);
      if (Object.keys(matches).length + 1 === set.pairs.length) {
        launchConfetti(50);
        loadFeedback();
      }
    } else {
      playSound('wrong');
      setSelectedWord(null);
    }
  };

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const words = set.pairs.map(p => p.word).join(', ');
      const fb = await getVocabMatchFeedback(words);
      setFeedback(fb);
    } catch { setFeedback('Great job matching all the words! Keep building your vocabulary.'); }
    finally { setLoading(false); }
  };

  const isWordMatched = (word) => !!matches[word];
  const isDefMatched  = (def)  => Object.values(matches).includes(def);

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        Click a word, then click its matching definition
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-green)', marginBottom: '4px' }}>Words</p>
          {set.pairs.map((p, i) => (
            <button key={i}
              className={`match-item ${selectedWord === p.word ? 'selected' : ''} ${isWordMatched(p.word) ? 'matched' : ''}`}
              onClick={() => handleWordClick(p.word)}
              disabled={isWordMatched(p.word)}
            >{p.word}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-teal)', marginBottom: '4px' }}>Definitions</p>
          {shuffledDefs.map((p, i) => (
            <button key={i}
              className={`match-item ${isDefMatched(p.def) ? 'matched' : ''}`}
              onClick={() => handleDefClick(p.def)}
              disabled={isDefMatched(p.def)}
            >{p.def}</button>
          ))}
        </div>
      </div>

      {allMatched && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px' }}>
          <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent-green)', marginBottom: '16px' }}>🎉 All matched!</div>
          {loading && <LoadingSpinner text="Getting example sentences..." />}
          {!loading && feedback && (
            <div className="ai-panel">
              <div className="ai-panel-header"><span>🤖</span><span className="ai-panel-label">Example Sentences</span></div>
              <p className="ai-panel-text">{feedback}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ─── GAME 2: Fill the Story ─────────────────────────────────── */
function FillStory({ launchConfetti }) {
  const story = FILL_STORIES[0];
  const [filled, setFilled] = useState({});
  const [selectedBank, setSelectedBank] = useState(null);
  const [completed, setCompleted] = useState(false);
  const { speak } = useSpeechSynthesis();

  const handleBlankClick = (blankId) => {
    if (!selectedBank) return;
    if (filled[blankId]) {
      setSelectedBank(null);
      return;
    }
    setFilled(f => ({ ...f, [blankId]: selectedBank }));
    setSelectedBank(null);
    playSound('chime');
    const allFilled = Object.keys({ ...filled, [blankId]: selectedBank }).length === story.blanks.length;
    if (allFilled) {
      setCompleted(true);
      launchConfetti(40);
    }
  };

  const handleWordBankClick = (word) => {
    const alreadyUsed = Object.values(filled).includes(word);
    if (alreadyUsed) return;
    setSelectedBank(selectedBank === word ? null : word);
    playSound('chime');
  };

  const clearBlank = (blankId) => {
    setFilled(f => { const n = { ...f }; delete n[blankId]; return n; });
    setCompleted(false);
  };

  const handleReadAloud = () => {
    const fullStory = story.text.map(line =>
      line.replace(/\[(\d+)\]/g, (_, id) => filled[parseInt(id)] || '____')
    ).join(' ');
    speak(fullStory, { rate: 0.85 });
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        Select a word from the bank below, then click a blank to fill it
      </p>

      {/* Word Bank */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-green)', marginBottom: '10px' }}>Word Bank</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {story.wordBank.map((w, i) => {
            const used = Object.values(filled).includes(w);
            return (
              <button key={i}
                className={`word-bank-chip ${used ? 'used' : ''} ${selectedBank === w ? 'selected' : ''}`}
                onClick={() => handleWordBankClick(w)}
                disabled={used}
                style={selectedBank === w ? { background: 'rgba(48,209,88,0.3)', transform: 'scale(1.05)' } : {}}
              >{w}</button>
            );
          })}
        </div>
      </div>

      {/* Story */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-green)', marginBottom: '16px' }}>
          📖 {story.title}
        </p>
        {story.text.map((line, li) => (
          <p key={li} style={{ fontSize: '1rem', lineHeight: 1.9, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            {line.split(/(\[\d+\])/).map((part, pi) => {
              const match = part.match(/\[(\d+)\]/);
              if (match) {
                const id = parseInt(match[1]);
                const val = filled[id];
                const correct = story.blanks.find(b => b.id === id)?.answer;
                return (
                  <span key={pi}
                    className={`story-blank ${!val ? 'empty' : ''}`}
                    onClick={() => val ? clearBlank(id) : handleBlankClick(id)}
                    style={{ color: completed ? (val === correct ? 'var(--color-accent-green)' : 'var(--color-accent-red)') : 'var(--color-accent-green)' }}
                    title={val ? 'Click to remove' : 'Click to fill'}
                  >{val || `___${id}___`}</span>
                );
              }
              return <span key={pi}>{part}</span>;
            })}
          </p>
        ))}
      </div>

      {completed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleReadAloud} style={{ flex: 1, justifyContent: 'center', background: 'var(--gradient-green)' }}>
            🔊 Read Story Aloud
          </button>
          <button className="btn-secondary" onClick={() => { setFilled({}); setCompleted(false); }} style={{ padding: '12px 20px' }}>
            🔄 Reset
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ─── GAME 3: Word of the Day ────────────────────────────────── */
function WordOfDay({ launchConfetti }) {
  const [wod, setWod]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [level, setLevel]       = useState('Intermediate');
  const [challenge, setChallenge] = useState('');
  const [feedback, setFeedback] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const { speak }               = useSpeechSynthesis();
  const { transcript, isListening, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  const loadWord = async (lv = level) => {
    setLoading(true);
    setWod(null);
    setChallenge('');
    setFeedback('');
    resetTranscript();
    try {
      const data = await getWordOfTheDay(lv);
      setWod(data);
    } catch {
      setWod({ word: 'Resilient', pronunciation: '/rɪˈzɪliənt/', partOfSpeech: 'adjective', definition: 'Able to withstand or recover quickly from difficult conditions.', examples: ['She is resilient in the face of challenges.', 'The resilient team bounced back after the loss.', 'Children are often more resilient than we think.'], speakingChallenge: 'Use "resilient" in a sentence about your last difficult experience.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadWord(); }, []); // eslint-disable-line

  const handleSpeak = () => { if (wod) speak(`${wod.word}. ${wod.definition}`, { rate: 0.85 }); };

  const handleMic = () => {
    if (isListening) {
      stopListening();
      setTimeout(async () => {
        if (!transcript) return;
        setFbLoading(true);
        try {
          const { getWordUsageFeedback } = await import('../services/geminiService');
          const fb = await getWordUsageFeedback(wod.word, transcript);
          setFeedback(fb);
          if (fb.toLowerCase().includes('correct') || fb.toLowerCase().includes('well done') || fb.toLowerCase().includes('great')) {
            playSound('correct'); launchConfetti(30);
          }
        } catch { setFeedback('Good attempt! Keep practicing using this word in context.'); }
        finally { setFbLoading(false); }
      }, 600);
    } else {
      resetTranscript();
      setFeedback('');
      startListening();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Beginner', 'Intermediate', 'Advanced'].map(lv => (
          <button key={lv}
            onClick={() => { setLevel(lv); loadWord(lv); }}
            style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              background: level === lv ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${level === lv ? 'rgba(48,209,88,0.35)' : 'var(--color-border)'}`,
              color: level === lv ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
            }}>{lv}</button>
        ))}
        <button onClick={() => loadWord()} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>🔄 New Word</button>
      </div>

      {loading && <LoadingSpinner text="Fetching today's word..." />}
      {!loading && wod && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="wod-card">
            <p className="wod-pos">{wod.partOfSpeech}</p>
            <h2 className="wod-word">{wod.word}</h2>
            <p className="wod-pron">{wod.pronunciation}</p>
            <p className="wod-def">"{wod.definition}"</p>
            <button className="btn-secondary" onClick={handleSpeak} style={{ margin: '0 auto 24px', display: 'flex' }}>🔊 Hear Pronunciation</button>

            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-green)', marginBottom: '10px' }}>Example Sentences</p>
              {wod.examples?.map((ex, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-accent-teal)', fontWeight: 700, minWidth: '18px' }}>{i + 1}.</span>
                  <p style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{ex}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent-orange)', marginBottom: '8px' }}>🎯 Speaking Challenge</p>
              <p style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{wod.speakingChallenge}</p>
            </div>

            {!isSupported && <p style={{ color: 'var(--color-accent-orange)', fontSize: '0.8rem', marginBottom: '12px' }}>⚠️ Use Chrome for voice recording</p>}
            <button onClick={handleMic}
              style={{ padding: '12px 28px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                background: isListening ? 'rgba(255,69,58,0.2)' : 'rgba(48,209,88,0.15)',
                border: `1px solid ${isListening ? 'var(--color-accent-red)' : 'rgba(48,209,88,0.4)'}`,
                color: isListening ? 'var(--color-accent-red)' : 'var(--color-accent-green)',
                animation: isListening ? 'pulse-ring 1s ease-in-out infinite' : 'none',
              }}
            >{isListening ? '⏹ Stop Recording' : '🎙️ Try the Challenge'}</button>

            {transcript && <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>You said: "{transcript}"</p>}
            {fbLoading && <div style={{ marginTop: '12px' }}><LoadingSpinner text="Checking usage..." /></div>}
            {feedback && !fbLoading && (
              <motion.div className="ai-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '12px', textAlign: 'left' }}>
                <div className="ai-panel-header"><span>🤖</span><span className="ai-panel-label">Usage Feedback</span></div>
                <p className="ai-panel-text">{feedback}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
