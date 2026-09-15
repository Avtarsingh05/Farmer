import React from 'react';
import { Mic } from 'lucide-react';
import { useMitra } from '../MitraProvider';
import { cn } from '@/utils/cn';

export function MitraButton() {
  const { isOpen, setIsOpen, state } = useMitra();

  if (isOpen) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
        state === 'listening' ? "bg-red-500 text-white animate-pulse" : "bg-primary text-white hover:bg-primary/90"
      )}
      aria-label="Open Mitra Voice Assistant"
    >
      <div className="flex items-center gap-2">
        <Mic className="w-6 h-6" />
        <span className="hidden sm:inline font-medium pr-1">Mitra</span>
      </div>
    </button>
  );
}
