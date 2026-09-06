import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, setDoc, deleteDoc, getDocs,
  query, where, orderBy,
} from '@/lib/firebase/firestore';
import type { Favorite } from '@/types';
import { isDemoMode, getStoredFavorites, saveStoredFavorites } from './mockStore';

function favoriteId(userId: string, productId: string): string {
  return `${userId}_${productId}`;
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredFavorites();
    if (!list.includes(productId)) {
      saveStoredFavorites([...list, productId]);
    }
    return;
  }

  try {
    await setDoc(doc(db, COLLECTIONS.FAVORITES, favoriteId(userId, productId)), {
      userId,
      productId,
      createdAt: serverTimestamp(),
    });
  } catch {
    const list = getStoredFavorites();
    if (!list.includes(productId)) {
      saveStoredFavorites([...list, productId]);
    }
  }
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  if (isDemoMode()) {
    const list = getStoredFavorites();
    saveStoredFavorites(list.filter((id) => id !== productId));
    return;
  }

  try {
    await deleteDoc(doc(db, COLLECTIONS.FAVORITES, favoriteId(userId, productId)));
  } catch {
    const list = getStoredFavorites();
    saveStoredFavorites(list.filter((id) => id !== productId));
  }
}

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  if (isDemoMode()) {
    const list = getStoredFavorites();
    return list.includes(productId);
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.FAVORITES, favoriteId(userId, productId)));
    return snap.exists();
  } catch {
    const list = getStoredFavorites();
    return list.includes(productId);
  }
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  if (isDemoMode()) {
    const list = getStoredFavorites();
    return list.map((productId) => ({
      id: `${userId}_${productId}`,
      userId,
      productId,
      createdAt: new Date(),
    }));
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.FAVORITES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id:        d.id,
      userId:    d.data().userId,
      productId: d.data().productId,
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    }));
  } catch {
    const list = getStoredFavorites();
    return list.map((productId) => ({
      id: `${userId}_${productId}`,
      userId,
      productId,
      createdAt: new Date(),
    }));
  }
}
