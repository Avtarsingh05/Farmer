import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, limit,
} from '@/lib/firebase/firestore';
import type { AppNotification, NotificationType } from '@/types';
import { isDemoMode, getStoredNotifications, saveStoredNotifications } from './mockStore';

function toNotification(id: string, d: Record<string, unknown>): AppNotification {
  return {
    id,
    userId:      d.userId as string,
    type:        d.type as NotificationType,
    title:       d.title as string,
    body:        d.body as string,
    isRead:      Boolean(d.isRead),
    relatedId:   d.relatedId as string | undefined,
    relatedType: d.relatedType as AppNotification['relatedType'],
    createdAt:   (d.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: string;
  relatedType?: AppNotification['relatedType'];
}): Promise<void> {
  if (isDemoMode()) {
    const notifs = getStoredNotifications();
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      ...data,
      isRead: false,
      createdAt: new Date(),
    };
    saveStoredNotifications([newNotif, ...notifs]);
    return;
  }

  try {
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...data,
      isRead:    false,
      createdAt: serverTimestamp(),
    });
  } catch {
    const notifs = getStoredNotifications();
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      ...data,
      isRead: false,
      createdAt: new Date(),
    };
    saveStoredNotifications([newNotif, ...notifs]);
  }
}

export async function getUserNotifications(
  userId: string,
  limitCount = 30
): Promise<AppNotification[]> {
  if (isDemoMode()) {
    const notifs = getStoredNotifications();
    return notifs.filter((n) => n.userId === userId).slice(0, limitCount);
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toNotification(d.id, d.data() as Record<string, unknown>));
  } catch {
    const notifs = getStoredNotifications();
    return notifs.filter((n) => n.userId === userId).slice(0, limitCount);
  }
}

export async function markNotificationRead(notifId: string): Promise<void> {
  if (isDemoMode()) {
    const notifs = getStoredNotifications();
    saveStoredNotifications(notifs.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    return;
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), { isRead: true });
  } catch {
    const notifs = getStoredNotifications();
    saveStoredNotifications(notifs.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (isDemoMode()) {
    const notifs = getStoredNotifications();
    saveStoredNotifications(notifs.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)));
    return;
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
  } catch {
    const notifs = getStoredNotifications();
    saveStoredNotifications(notifs.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)));
  }
}
