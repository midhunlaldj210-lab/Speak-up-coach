import { useCallback, useRef, useState } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Try to use a pleasant English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = [
      'Google US English',
      'Microsoft Aria Online (Natural)',
      'Microsoft David Online (Natural)',
      'en-US-Neural2-F',
      'Samantha',
    ];

    const preferred = voices.find((v) =>
      preferredVoices.some((p) => v.name.includes(p.split(' ')[0]))
    );
    const englishVoice = voices.find((v) => v.lang.startsWith('en'));

    if (preferred) utterance.voice = preferred;
    else if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (options.onEnd) options.onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
