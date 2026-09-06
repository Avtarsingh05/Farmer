import { createContext, useContext } from 'react';
import type { AppNotification } from '@/types';

export interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount:   number;
  loading:       boolean;
  markRead:      (id: string) => Promise<void>;
  markAllRead:   () => Promise<void>;
  markAsRead:    (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh:       () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
