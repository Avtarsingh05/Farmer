import React, { useState, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '@/i18n';
import { useClickOutside } from '@/hooks';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: (string | undefined | null | false)[]) => twMerge(clsx(args));

interface LanguageSelectorProps {
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'light',
  className = '',
  showLabel = true,
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
          variant === 'dark'
            ? 'bg-neutral-800/80 text-white hover:bg-neutral-700 border border-neutral-700/80'
            : variant === 'glass'
            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'
            : 'bg-neutral-100/80 text-neutral-800 hover:bg-neutral-200/80 border border-neutral-200/80'
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-primary shrink-0" />
        {showLabel && (
          <span className="font-bold tracking-wide">
            {currentLang.nativeLabel}
          </span>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 text-neutral-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-2xl border border-neutral-200/80 py-2 z-50 animate-fade-in origin-top-right overflow-hidden focus:outline-none"
          role="menu"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
            Select Language / भाषा निवडा
          </div>
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-left transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.nativeLabel}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
