import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './config';

export { auth };

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new Firebase Auth account.
 */
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with Google.
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Sign out the current user.
 */
export async function logOut() {
  return signOut(auth);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Send an email verification to the current user.
 */
export async function verifyEmail(user: User) {
  return sendEmailVerification(user);
}

/**
 * Update the current user's display name / photo URL.
 */
export async function updateUserProfile(
  user: User,
  updates: { displayName?: string; photoURL?: string }
) {
  return updateProfile(user, updates);
}
