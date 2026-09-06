import React, { useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (newIndex !== index) {
      e.preventDefault();
      onTabChange(tabs[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className={cn('border-b border-neutral-200', className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    '-ml-0.5 mr-2 h-5 w-5',
                    isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-500'
                  )}
                  aria-hidden="true"
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
