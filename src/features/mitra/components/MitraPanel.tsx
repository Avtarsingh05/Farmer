import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Send, Loader2, Volume2, VolumeX, AlertCircle, Sparkles, Check, RotateCcw } from 'lucide-react';
import { useMitra } from '../MitraProvider';
import { cn } from '@/utils/cn';
import { MitraLanguage } from '../types';

export function MitraPanel() {
  const { 
    isOpen, setIsOpen, state, toggleListening, 
    messages, interimTranscript, pendingIntent,
    confirmIntent, cancelIntent, sendTextMessage,
    language, setLanguage, permissionError,
    isSpeaking, isVoiceEnabled, setIsVoiceEnabled, stopSpeaking
  } = useMitra();
  
  const [textInput, setTextInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, interimTranscript, state]);

  if (!isOpen) return null;

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendTextMessage(textInput.trim());
    setTextInput('');
  };

  const handleQuickAction = (text: string) => {
    sendTextMessage(text);
  };

  const getStatusText = () => {
    switch(state) {
      case 'listening': return 'Mitra sun raha hai... (Bolna shuru karein)';
      case 'processing': return 'Mitra samajh raha hai...';
      case 'confirming': return 'Kripya confirm karein...';
      case 'executing': return 'Mitra kaam kar raha hai...';
      case 'responding': return 'Mitra bol raha hai...';
      case 'error': return 'Error! Dobara try karein.';
      default: return 'Mitra se baat karein ya type karein';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed bottom-0 right-0 w-full sm:w-[420px] h-[85vh] sm:h-[620px] max-h-screen bg-white shadow-2xl rounded-t-3xl sm:rounded-tl-3xl sm:rounded-tr-none z-50 flex flex-col border border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50 rounded-t-3xl sm:rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors", 
              state === 'listening' ? "bg-red-500 text-white animate-pulse" : "bg-primary-600 text-white"
            )}>
              {state === 'processing' || state === 'executing' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-neutral-900 text-base leading-tight">Mitra</h2>
                <span className="text-[10px] bg-primary-50 text-primary-700 font-semibold px-1.5 py-0.5 rounded border border-primary-200">Voice</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium line-clamp-1">{getStatusText()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Audio Voice Responses Toggle */}
            <button 
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              title={isVoiceEnabled ? "Mute Voice Responses" : "Enable Voice Responses"}
              className={cn(
                "p-2 rounded-full transition-colors",
                isVoiceEnabled ? "text-primary-700 hover:bg-primary-50" : "text-neutral-400 hover:bg-neutral-100"
              )}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as MitraLanguage)}
              className="text-xs bg-white border border-neutral-200 rounded-full px-2.5 py-1 outline-none cursor-pointer text-neutral-700 font-medium shadow-sm hover:border-neutral-300"
            >
              <option value="hi-IN">हिन्दी (Hindi)</option>
              <option value="en-US">English</option>
              <option value="pa-IN">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>

            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Permission / Browser Error Banner */}
        {permissionError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Microphone Access Notice</p>
              <p className="mt-0.5">{permissionError} You can also type your message in the box below.</p>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/40">
          {messages.length === 0 ? (
            <div className="text-center py-6 px-2">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-800 text-sm">Namaste! Main Mitra hoon.</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-[260px] mx-auto">
                Aap bolkar produce list kar sakte hain, market search kar sakte hain, ya orders track kar sakte hain.
              </p>

              {/* Quick Suggestion Chips */}
              <div className="mt-4 space-y-1.5 text-left">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">Try saying or tapping:</p>
                <button
                  onClick={() => handleQuickAction("Mere paas 100 kilo tamatar hain")}
                  className="w-full text-left text-xs bg-white hover:bg-neutral-50 text-neutral-700 p-2.5 rounded-xl border border-neutral-200 transition-colors shadow-2xs"
                >
                  "Mere paas 100 kilo tamatar hain"
                </button>
                <button
                  onClick={() => handleQuickAction("Pichle 30 din mein tamatar ka rate kaisa raha?")}
                  className="w-full text-left text-xs bg-white hover:bg-neutral-50 text-neutral-700 p-2.5 rounded-xl border border-neutral-200 transition-colors shadow-2xs"
                >
                  "Pichle 30 din mein tamatar ka rate kaisa raha?"
                </button>
                <button
                  onClick={() => handleQuickAction("Amritsar aur Jalandhar mein tamatar ka price compare karo")}
                  className="w-full text-left text-xs bg-white hover:bg-neutral-50 text-neutral-700 p-2.5 rounded-xl border border-neutral-200 transition-colors shadow-2xs"
                >
                  "Amritsar aur Jalandhar mein tamatar ka price compare karo"
                </button>
                <button
                  onClick={() => handleQuickAction("Mera order kahan hai?")}
                  className="w-full text-left text-xs bg-white hover:bg-neutral-50 text-neutral-700 p-2.5 rounded-xl border border-neutral-200 transition-colors shadow-2xs"
                >
                  "Mera order kahan hai?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-2xs", 
                m.sender === 'user' 
                  ? "bg-primary-600 text-white ml-auto rounded-br-xs" 
                  : "bg-white text-neutral-800 mr-auto rounded-bl-xs border border-neutral-200/80",
                m.isError && "bg-red-50 text-red-700 border-red-200"
              )}>
                <p>{m.text}</p>
              </div>
            ))
          )}

          {/* Interim transcript stream */}
          {interimTranscript && (
            <div className="max-w-[85%] p-3 rounded-2xl bg-neutral-100 text-neutral-600 ml-auto rounded-br-xs border border-neutral-200 italic text-sm animate-pulse">
              <p>{interimTranscript}...</p>
            </div>
          )}

          {/* Action Card for Confirmations */}
          {state === 'confirming' && pendingIntent && (
            <div className="mr-auto w-full bg-white border border-amber-300 rounded-2xl p-4 shadow-md animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h4 className="font-bold text-neutral-900 text-sm">Listing Confirmation</h4>
              </div>
              
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-xs text-neutral-800 mb-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Produce:</span>
                  <span className="font-bold">{pendingIntent.arguments.product || 'Produce'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Quantity:</span>
                  <span className="font-bold">{pendingIntent.arguments.quantity} {pendingIntent.arguments.unit || 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Asking Price:</span>
                  <span className="font-bold text-primary-700">₹{pendingIntent.arguments.price} / {pendingIntent.arguments.unit || 'kg'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={cancelIntent} 
                  className="flex-1 py-2 text-xs font-semibold rounded-full bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmIntent} 
                  className="flex-1 py-2 text-xs font-bold rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm & List
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Bottom Input / Voice Control Area */}
        <div className="p-4 bg-white border-t border-neutral-100">
          <form onSubmit={handleSubmitText} className="flex items-center gap-2 mb-3">
            <input 
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type in Hindi, English, Punjabi..."
              className="flex-1 bg-neutral-100 border border-transparent focus:border-primary-400 focus:bg-white rounded-full px-4 py-2.5 text-sm outline-none transition-all"
              disabled={state === 'processing' || state === 'executing'}
            />
            <button 
              type="submit"
              disabled={!textInput.trim() || state === 'processing' || state === 'executing'}
              className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full disabled:opacity-40 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Large Central Voice Tap Target (Min 48px, optimal for mobile accessibility) */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <button
              type="button"
              onClick={toggleListening}
              disabled={state === 'processing' || state === 'executing'}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                state === 'listening' 
                  ? "bg-red-500 text-white scale-110 ring-4 ring-red-200 animate-pulse" 
                  : "bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 active:scale-95",
                (state === 'processing' || state === 'executing') && "opacity-50 cursor-not-allowed scale-95"
              )}
              aria-label={state === 'listening' ? "Stop listening" : "Start speaking"}
            >
              <Mic className="w-7 h-7" />
            </button>
            <span className="text-[11px] font-medium text-neutral-500 mt-2">
              {state === 'listening' ? '🔴 Tap to stop listening' : 'Tap microphone to speak'}
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
