import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where,
  fromSnapshot,
} from '@/lib/firebase/firestore';
import type { AppUser, UserRole, UserStatus } from '@/types';
import { isDemoMode, DEMO_USERS, getStoredUser, saveStoredUser } from './mockStore';
import { isUserAdmin } from '@/config/admin';

/**
 * Create a new user document in Firestore after registration.
 */
export async function createUserDocument(
  uid: string,
  data: { name: string; email: string; role: UserRole; phone?: string }
): Promise<void> {
  const finalRole: UserRole = isUserAdmin(uid) ? 'admin' : data.role;
  if (isDemoMode()) {
    const newUser: AppUser = {
      uid,
      id: uid,
      role: finalRole,
      name: data.name,
      email: data.email,
      phone: data.phone,
      isEmailVerified: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveStoredUser(newUser);
    return;
  }
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    uid,
    role:             finalRole,
    name:             data.name,
    email:            data.email,
    phone:            data.phone ?? null,
    photoURL:         null,
    isEmailVerified:  false,
    status:           'active' satisfies UserStatus,
    createdAt:        serverTimestamp(),
    updatedAt:        serverTimestamp(),
  });
}

/**
 * Fetch a user document by UID.
 */
export async function getUserDocument(uid: string): Promise<AppUser | null> {
  const isAdmin = isUserAdmin(uid);

  if (isDemoMode()) {
    const stored = getStoredUser();
    if (stored && (stored.uid === uid || stored.id === uid)) {
      if (isAdmin) stored.role = 'admin';
      return stored;
    }
    const foundDemo = Object.values(DEMO_USERS).find(u => u.uid === uid || u.id === uid);
    if (foundDemo) {
      if (isAdmin) foundDemo.role = 'admin';
      return foundDemo;
    }
    if (isAdmin) {
      return {
        uid,
        id: uid,
        role: 'admin',
        name: 'Platform Administrator',
        email: 'admin@kisanmitra.in',
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return DEMO_USERS.farmer;
  }
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!snap.exists()) {
      const stored = getStoredUser();
      if (stored && (stored.uid === uid || stored.id === uid)) {
        if (isAdmin) stored.role = 'admin';
        return stored;
      }
      if (isAdmin) {
        return {
          uid,
          id: uid,
          role: 'admin',
          name: 'Platform Administrator',
          email: 'admin@kisanmitra.in',
          isEmailVerified: true,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }
    const data = snap.data();
    return {
      uid:             snap.id,
      id:              snap.id,
      role:            isAdmin ? 'admin' : data.role,
      name:            data.name,
      email:           data.email,
      phone:           data.phone ?? undefined,
      photoURL:        data.photoURL ?? undefined,
      avatar:          data.photoURL ?? undefined,
      isEmailVerified: data.isEmailVerified ?? false,
      status:          data.status ?? 'active',
      createdAt:       data.createdAt?.toDate?.() ?? new Date(),
      updatedAt:       data.updatedAt?.toDate?.() ?? new Date(),
    };
  } catch {
    const stored = getStoredUser();
    if (stored && (stored.uid === uid || stored.id === uid)) {
      if (isAdmin) stored.role = 'admin';
      return stored;
    }
    if (isAdmin) {
      return {
        uid,
        id: uid,
        role: 'admin',
        name: 'Platform Administrator',
        email: 'admin@kisanmitra.in',
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }
}

/**
 * Update allowed user fields.
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<AppUser, 'name' | 'phone' | 'photoURL'>>
): Promise<void> {
  if (isDemoMode()) {
    const stored = getStoredUser();
    if (stored) {
      const updated = { ...stored, ...updates, updatedAt: new Date() };
      saveStoredUser(updated);
    }
    return;
  }
  const allowed: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.name     !== undefined) allowed.name     = updates.name;
  if (updates.phone    !== undefined) allowed.phone    = updates.phone;
  if (updates.photoURL !== undefined) allowed.photoURL = updates.photoURL;
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), allowed);
}

export const updateProfile = updateUserProfile;

/**
 * ADMIN ONLY — Fetch all users.
 */
export async function getAllUsers(limitCount = 50): Promise<AppUser[]> {
  if (isDemoMode()) {
    return Object.values(DEMO_USERS).slice(0, limitCount);
  }
  try {
    const q = query(collection(db, COLLECTIONS.USERS));
    const snap = await getDocs(q);
    if (snap.empty) return Object.values(DEMO_USERS).slice(0, limitCount);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid:             d.id,
        id:              d.id,
        role:            isUserAdmin(d.id) ? 'admin' : data.role,
        name:            data.name,
        email:           data.email,
        phone:           data.phone ?? undefined,
        photoURL:        data.photoURL ?? undefined,
        avatar:          data.photoURL ?? undefined,
        isEmailVerified: data.isEmailVerified ?? false,
        status:          data.status ?? 'active',
        createdAt:       data.createdAt?.toDate?.() ?? new Date(),
        updatedAt:       data.updatedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch {
    return Object.values(DEMO_USERS).slice(0, limitCount);
  }
}

/**
 * ADMIN ONLY — Update user status.
 */
export async function updateUserStatus(uid: string, status: UserStatus): Promise<void> {
  if (isDemoMode()) return;
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}
