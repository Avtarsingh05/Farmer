import { useState, useEffect, useCallback, useRef } from 'react';

// Extend window for webkit speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface UseSpeechRecognitionProps {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition({
  language = 'hi-IN',
  onResult,
  onError,
  onEnd,
}: UseSpeechRecognitionProps = {}) {
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const shouldListenRef = useRef<boolean>(false);

  // Store callbacks in refs to avoid recreating the SpeechRecognition instance on re-render
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);
  const langRef = useRef(language);

  // Update refs in effects, not during render
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    langRef.current = language;
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langRef.current;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setPermissionError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (onResultRef.current) {
        if (finalTranscript.trim()) {
          onResultRef.current(finalTranscript.trim(), true);
        } else if (interimTranscript.trim()) {
          onResultRef.current(interimTranscript.trim(), false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore non-fatal transient events
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        const msg = 'Microphone permission denied. Please allow microphone in browser settings.';
        setPermissionError(msg);
        if (onErrorRef.current) onErrorRef.current(msg);
      } else {
        if (onErrorRef.current) onErrorRef.current(event.error || 'Speech error');
      }

      isListeningRef.current = false;
      shouldListenRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (shouldListenRef.current && isListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // ignore already started
        }
      }

      isListeningRef.current = false;
      setIsListening(false);
      if (onEndRef.current) onEndRef.current();
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onErrorRef.current) onErrorRef.current('Web Speech API is not supported in this browser.');
      return;
    }

    setPermissionError(null);
    shouldListenRef.current = true;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        const msg = 'Microphone permission denied. Please allow microphone access.';
        setPermissionError(msg);
        if (onErrorRef.current) onErrorRef.current(msg);
        shouldListenRef.current = false;
        return;
      }
    }

    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.lang = langRef.current;
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (err: any) {
      if (err?.name !== 'InvalidStateError') {
        console.warn('Could not start speech recognition:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  return {
    isSupported,
    isListening,
    permissionError,
    startListening,
    stopListening,
  };
}
