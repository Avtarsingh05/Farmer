/**
 * Map Firebase Auth error codes to user-friendly messages.
 */
export function mapAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Invalid email or password.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed':  'Network error. Check your connection and try again.',
    'auth/user-disabled':           'This account has been disabled. Contact support.',
    'auth/weak-password':           'Password must be at least 8 characters.',
    'auth/popup-closed-by-user':    'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/popup-blocked':           'Sign-in popup was blocked. Allow popups and try again.',
    'auth/requires-recent-login':   'Please log out and log back in to continue.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

/**
 * Map Firestore error codes to user-friendly messages.
 */
export function mapFirestoreError(code: string): string {
  const map: Record<string, string> = {
    'permission-denied':    'You don\'t have permission to do that.',
    'not-found':            'The requested information could not be found.',
    'already-exists':       'This already exists.',
    'resource-exhausted':   'Service is temporarily busy. Please try again.',
    'unavailable':          'Service is temporarily unavailable. Please try again.',
    'deadline-exceeded':    'Request timed out. Check your connection and try again.',
    'unauthenticated':      'You need to be logged in to do that.',
    'failed-precondition':  'This action cannot be completed right now.',
    'invalid-argument':     'Invalid data provided.',
    'out-of-range':         'Value is out of acceptable range.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

/**
 * Extract a readable message from any error object.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;
    if (code.startsWith('auth/')) return mapAuthError(code);
    return mapFirestoreError(code);
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred. Please try again.';
}
