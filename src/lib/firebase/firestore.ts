import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';

export { db, serverTimestamp };
export type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QueryConstraint,
};

// Re-export query helpers so services don't import directly from firebase/firestore
export {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
};

/**
 * Collection name constants — single source of truth.
 * Never use raw strings in service files.
 */
export const COLLECTIONS = {
  USERS:         'users',
  FARMERS:       'farmers',
  FARMS:         'farms',
  BUYERS:        'buyers',
  PRODUCTS:      'products',
  CATEGORIES:    'categories',
  ORDERS:        'orders',
  INVENTORY:     'inventory',
  FAVORITES:     'favorites',
  NOTIFICATIONS: 'notifications',
  MARKET_PRICES: 'marketPrices',
  REPORTS:       'reports',
} as const;

/**
 * Convert a Firestore document snapshot into a typed object,
 * including the document id.
 */
export function fromSnapshot<T extends { id: string }>(
  snap: DocumentSnapshot<DocumentData>
): T | null {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/**
 * Convert an array of query snapshots to typed objects.
 */
export function fromSnapshots<T extends { id: string }>(
  snaps: QueryDocumentSnapshot<DocumentData>[]
): T[] {
  return snaps.map((s) => ({ id: s.id, ...s.data() }) as T);
}
