import { useState, useCallback, useEffect, useRef } from 'react';

export function useSpeechSynthesis() {
  const [isSupported] = useState<boolean>(() => typeof window !== 'undefined' && Boolean(window.speechSynthesis));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  // Chromium garbage-collection prevention ref
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Retry once in 500ms if voices were empty initially (Chrome quirk)
    const timer = setTimeout(loadVoices, 500);

    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [loadVoices]);

  const speak = useCallback((text: string, language: string = 'hi-IN') => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    // Clean up any ongoing speech first
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    activeUtteranceRef.current = utterance;

    // Normalize language tag (e.g. 'hi' -> 'hi-IN', 'pa' -> 'pa-IN', 'en' -> 'en-IN')
    let targetLang = language;
    if (targetLang === 'hi' || targetLang === 'hi-Latn') targetLang = 'hi-IN';
    if (targetLang === 'pa') targetLang = 'pa-IN';
    if (targetLang === 'en') targetLang = 'en-IN';

    // Find voice matching language
    const langPrefix = targetLang.split('-')[0].toLowerCase();
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    
    const matchingVoices = currentVoices.filter(v => 
      v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
    );

    if (matchingVoices.length > 0) {
      // Prioritize natural/Google/Microsoft/online voices
      const premiumVoice = matchingVoices.find(v => 
        v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('India')
      );
      utterance.voice = premiumVoice || matchingVoices[0];
    }

    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      // 'interrupted' or 'canceled' are expected when user stops or starts new speech
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis warning:', e.error);
      }
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    };

    // Ensure audio resume if audio context was suspended
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  }, [voices, isVoiceEnabled]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    }
  }, []);

  return {
    isSupported,
    isSpeaking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    speak,
    stop,
    voices
  };
}
