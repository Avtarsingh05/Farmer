import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc, getDocs, setDoc,
  query, where, orderBy,
} from '@/lib/firebase/firestore';
import type { Category } from '@/types';
import { isDemoMode, DEMO_CATEGORIES, withFirestoreTimeout } from './mockStore';

function toCategory(id: string, d: Record<string, unknown>): Category {
  return {
    id,
    name:        d.name as string,
    slug:        d.slug as string,
    icon:        d.icon as string | undefined,
    description: d.description as string | undefined,
    parentId:    d.parentId as string | null | undefined,
    isActive:    Boolean(d.isActive),
    order:       (d.order as number) ?? 0,
    createdAt:   (d.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt:   (d.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

export async function getActiveCategories(): Promise<Category[]> {
  if (isDemoMode()) {
    return DEMO_CATEGORIES.filter((c) => c.isActive);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) return DEMO_CATEGORIES.filter((c) => c.isActive);
    return snap.docs.map((d) => toCategory(d.id, d.data() as Record<string, unknown>));
  } catch {
    return DEMO_CATEGORIES.filter((c) => c.isActive);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  if (isDemoMode()) {
    return DEMO_CATEGORIES;
  }
  try {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('order', 'asc'));
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) return DEMO_CATEGORIES;
    return snap.docs.map((d) => toCategory(d.id, d.data() as Record<string, unknown>));
  } catch {
    return DEMO_CATEGORIES;
  }
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CATEGORIES, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
}
