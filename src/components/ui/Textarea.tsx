import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      maxLength,
      id,
      onChange,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const [charCount, setCharCount] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="form-label block text-sm font-medium text-neutral-900 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            required={required}
            maxLength={maxLength}
            rows={rows}
            onChange={handleChange}
            className={cn(
              'form-input block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition-colors',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${textareaId}-error` : helperText ? `${textareaId}-description` : undefined
            }
            {...props}
          />
        </div>
        <div className="flex justify-between mt-1">
          <div>
            {error && (
              <p className="form-error text-sm text-red-600" id={`${textareaId}-error`}>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-neutral-500" id={`${textareaId}-description`}>
                {helperText}
              </p>
            )}
          </div>
          {maxLength && (
            <p className="text-xs text-neutral-500 self-end">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
