import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { MitraState, MitraLanguage, MitraMessage, MitraIntent } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { processVoiceInput } from './MitraAiService';
import { executeMitraTool } from './MitraTools';
import { useAuth } from '@/hooks';

interface MitraContextType {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  state: MitraState;
  language: MitraLanguage;
  setLanguage: (lang: MitraLanguage) => void;
  messages: MitraMessage[];
  transcript: string;
  interimTranscript: string;
  pendingIntent: MitraIntent | null;
  permissionError: string | null;
  isSpeaking: boolean;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  stopSpeaking: () => void;
  
  toggleListening: () => void;
  confirmIntent: () => void;
  cancelIntent: () => void;
  sendTextMessage: (text: string) => void;
}

const MitraContext = createContext<MitraContextType | undefined>(undefined);

export function MitraProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<MitraState>('idle');
  const [language, setLanguage] = useState<MitraLanguage>('hi-IN' as any);
  const [messages, setMessages] = useState<MitraMessage[]>([]);
  
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [pendingIntent, setPendingIntent] = useState<MitraIntent | null>(null);

  // Conversational state memory across turns (e.g. product specified in turn 1, price in turn 2)
  const pendingListingRef = useRef<{ product?: string; quantity?: number; unit?: string } | null>(null);

  const { user } = useAuth();
  const { speak, stop: stopSpeaking, isSpeaking, isVoiceEnabled, setIsVoiceEnabled } = useSpeechSynthesis();

  // Reset helper
  const resetSession = () => {
    setTranscript('');
    setInterimTranscript('');
    setPendingIntent(null);
  };

  const handleExecuteIntent = async (intent: MitraIntent) => {
    setState('executing');
    
    const result = await executeMitraTool(intent, user);
    
    // Reset partial context after execution
    pendingListingRef.current = null;

    // Handle Navigation specifically since tool doesn't know router
    if (result.success && (intent.tool === 'navigate' || intent.tool === 'checkOrders' || intent.tool === 'checkInventory')) {
       if (result.data?.route) {
         window.location.href = result.data.route;
         setIsOpen(false);
       }
    } else if (result.success && intent.tool === 'searchProducts') {
       if (result.data?.query) {
         window.location.href = `/market?q=${encodeURIComponent(result.data.query)}`;
         setIsOpen(false);
       }
    }

    const reply = result.message || 'Complete.';
    speak(reply, language as string);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'mitra', text: reply, timestamp: new Date(), isError: !result.success }]);
    
    setState('idle');
    setPendingIntent(null);
  };

  // Process the finalized transcript
  const handleFinalTranscript = async (finalText: string) => {
    setState('processing');
    setTranscript(finalText);
    setInterimTranscript('');
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: finalText, timestamp: new Date() }]);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const context = pendingListingRef.current ? { pendingListing: pendingListingRef.current } : undefined;

    const intent = await processVoiceInput(finalText, apiKey, context);
    
    // Handle multi-turn conversation where price was missing
    if (intent.arguments?.partialListing) {
      pendingListingRef.current = intent.arguments.partialListing;
      setState('idle');
      if (intent.confirmationMessage) {
        speak(intent.confirmationMessage, language as string);
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'mitra', text: intent.confirmationMessage!, timestamp: new Date() }]);
      }
      return;
    }

    if (intent.requiresConfirmation) {
      setPendingIntent(intent);
      setState('confirming');
      
      // Speak the confirmation prompt
      if (intent.confirmationMessage) {
        speak(intent.confirmationMessage, language as string);
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'mitra', text: intent.confirmationMessage!, timestamp: new Date() }]);
      }
    } else if (intent.tool !== 'unknown') {
      // Execute immediately (e.g. read-only, navigation, search)
      await handleExecuteIntent(intent);
    } else {
      setState('idle');
      const fallbackMsg = intent.confirmationMessage || 'Mujhe samajh nahi aaya. Dobara boliye.';
      speak(fallbackMsg, language as string);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'mitra', text: fallbackMsg, timestamp: new Date() }]);
    }
  };

  const handleSpeechResult = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      stopListening();
      handleFinalTranscript(text);
    } else {
      setInterimTranscript(text);
    }
  }, []);

  const handleSpeechError = useCallback((errMsg: string) => {
    console.warn('Speech recognition error:', errMsg);
    setState('error');
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setState(prev => prev === 'listening' ? 'idle' : prev);
  }, []);

  const { startListening, stopListening, isListening, permissionError } = useSpeechRecognition({
    language: language as string,
    onResult: handleSpeechResult,
    onError: handleSpeechError,
    onEnd: handleSpeechEnd
  });

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setState('idle');
    } else {
      resetSession();
      setState('listening');
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const confirmIntent = () => {
    if (pendingIntent) {
      handleExecuteIntent(pendingIntent);
    }
  };

  const cancelIntent = () => {
    pendingListingRef.current = null;
    setPendingIntent(null);
    setState('idle');
    speak("Thik hai, cancel kar diya.", language as string);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'mitra', text: "Action cancelled.", timestamp: new Date() }]);
  };

  const sendTextMessage = async (text: string) => {
    resetSession();
    await handleFinalTranscript(text);
  };

  return (
    <MitraContext.Provider value={{
      isOpen, setIsOpen,
      state, language, setLanguage,
      messages, transcript, interimTranscript, pendingIntent,
      permissionError, isSpeaking, isVoiceEnabled, setIsVoiceEnabled, stopSpeaking,
      toggleListening, confirmIntent, cancelIntent, sendTextMessage
    }}>
      {children}
    </MitraContext.Provider>
  );
}

export function useMitra() {
  const context = useContext(MitraContext);
  if (!context) throw new Error("useMitra must be used within MitraProvider");
  return context;
}
