import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'neutral';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  showDot = false,
  children,
  ...props
}) => {
  const variants = {
    green: 'badge-green bg-green-100 text-green-800',
    amber: 'badge-amber bg-amber-100 text-amber-800',
    red: 'badge-red bg-red-100 text-red-800',
    blue: 'badge-blue bg-blue-100 text-blue-800',
    neutral: 'badge-neutral bg-neutral-100 text-neutral-800',
  };

  const dotColors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    neutral: 'bg-neutral-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {showDot && (
        <svg className={cn('-ml-0.5 mr-1.5 h-2 w-2 rounded-full', dotColors[variant])} fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )}
      {children}
    </span>
  );
};
