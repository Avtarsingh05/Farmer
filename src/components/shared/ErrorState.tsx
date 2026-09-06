import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">Something went wrong</h3>
      <p className="text-neutral-600 mb-6 max-w-sm">{error}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="btn-secondary"
        >
          Try again
        </button>
      )}
    </div>
  );
}
