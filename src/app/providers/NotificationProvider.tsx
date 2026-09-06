import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppNotification } from '@/types';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notificationService';
import { useAuth } from '@/hooks';
import { NotificationContext } from './NotificationContext';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    setLoading(true);
    try {
      const data = await getUserNotifications(user.uid);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markRead, markAllRead,
      markAsRead: markRead, markAllAsRead: markAllRead,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

