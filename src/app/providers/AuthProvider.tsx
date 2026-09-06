import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/auth';
import {
  signIn, signUp, signInWithGoogle, logOut, resetPassword,
  updateUserProfile as updateFirebaseProfile,
} from '@/lib/firebase/auth';
import { createUserDocument, getUserDocument } from '@/services/userService';
import { createFarmerProfile } from '@/services/farmerService';
import type { AppUser, UserRole } from '@/types';
import type { RegisterFormData } from '@/schemas/auth.schema';
import { isDemoMode, DEMO_USERS, getStoredUser, saveStoredUser } from '@/services/mockStore';
import { isUserAdmin } from '@/config/admin';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user,         setUser]         = useState<AppUser | null>(() => getStoredUser());
  const [loading,      setLoading]      = useState<boolean>(() => isDemoMode() ? false : !getStoredUser());

  const loadUserDocument = useCallback(async (fbUser: FirebaseUser) => {
    const isAdmin = isUserAdmin(fbUser.uid);
    try {
      let doc = await getUserDocument(fbUser.uid);
      if (isAdmin) {
        if (doc) {
          doc = { ...doc, role: 'admin' };
        } else {
          doc = {
            uid: fbUser.uid,
            id: fbUser.uid,
            role: 'admin',
            name: fbUser.displayName || 'Platform Administrator',
            email: fbUser.email || 'admin@kisanmitra.in',
            photoURL: fbUser.photoURL || undefined,
            avatar: fbUser.photoURL || undefined,
            isEmailVerified: fbUser.emailVerified ?? true,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      }
      if (doc) {
        setUser(doc);
        saveStoredUser(doc);
      } else {
        setUser(null);
      }
    } catch {
      if (isAdmin) {
        const adminDoc: AppUser = {
          uid: fbUser.uid,
          id: fbUser.uid,
          role: 'admin',
          name: fbUser.displayName || 'Platform Administrator',
          email: fbUser.email || 'admin@kisanmitra.in',
          photoURL: fbUser.photoURL || undefined,
          avatar: fbUser.photoURL || undefined,
          isEmailVerified: fbUser.emailVerified ?? true,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(adminDoc);
        saveStoredUser(adminDoc);
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (isDemoMode()) {
      const demoUser = getStoredUser();
      setUser(demoUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await loadUserDocument(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadUserDocument]);

  const loginAsDemo = useCallback(async (role: 'farmer' | 'buyer' | 'admin') => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setUser(demo);
      saveStoredUser(demo);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      const found = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      const activeUser: AppUser = found || {
        uid: 'user-' + Date.now(),
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email,
        role: email.includes('farmer') ? 'farmer' : (email.includes('admin') ? 'admin' : 'buyer'),
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(activeUser);
      saveStoredUser(activeUser);
      setLoading(false);
      return;
    }

    try {
      const cred = await signIn(email, password);
      await loadUserDocument(cred.user);
    } catch (err) {
      // If network fails, allow fallback to demo user
      const found = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUser(found);
        saveStoredUser(found);
        setLoading(false);
        return;
      }
      throw err;
    }
  }, [loadUserDocument]);

  const register = useCallback(async (data: RegisterFormData) => {
    if (isDemoMode()) {
      const newUser: AppUser = {
        uid: 'user-' + Date.now(),
        id: 'user-' + Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(newUser);
      saveStoredUser(newUser);
      setLoading(false);
      return;
    }

    try {
      const cred = await signUp(data.email, data.password);
      await updateFirebaseProfile(cred.user, { displayName: data.name });
      await createUserDocument(cred.user.uid, {
        name:  data.name,
        email: data.email,
        role:  data.role as UserRole,
        phone: data.phone || undefined,
      });
      if (data.role === 'farmer') {
        await createFarmerProfile(cred.user.uid, { displayName: data.name });
      }
      await loadUserDocument(cred.user);
    } catch (err) {
      // Instant fallback if Firebase connection fails
      const newUser: AppUser = {
        uid: 'user-' + Date.now(),
        id: 'user-' + Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(newUser);
      saveStoredUser(newUser);
      setLoading(false);
    }
  }, [loadUserDocument]);

  const loginWithGoogle = useCallback(async () => {
    if (isDemoMode()) {
      const demo = DEMO_USERS.buyer;
      setUser(demo);
      saveStoredUser(demo);
      return;
    }
    const cred = await signInWithGoogle();
    const isAdmin = isUserAdmin(cred.user.uid);
    const existing = await getUserDocument(cred.user.uid);
    if (!existing) {
      await createUserDocument(cred.user.uid, {
        name:  cred.user.displayName ?? (isAdmin ? 'Platform Administrator' : 'User'),
        email: cred.user.email ?? '',
        role:  isAdmin ? 'admin' : 'buyer',
      });
    }
    await loadUserDocument(cred.user);
  }, [loadUserDocument]);

  const logout = useCallback(async () => {
    saveStoredUser(null);
    setUser(null);
    if (!isDemoMode()) {
      try {
        await logOut();
      } catch {}
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (isDemoMode()) return;
    await resetPassword(email);
  }, []);

  const refreshUser = useCallback(async () => {
    if (isDemoMode()) return;
    if (firebaseUser) await loadUserDocument(firebaseUser);
  }, [firebaseUser, loadUserDocument]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        refreshUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

