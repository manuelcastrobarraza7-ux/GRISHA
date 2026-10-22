import { auth } from './firebase';

const DRIVE_TOKEN_KEY = 'google_drive_token';
const DRIVE_CONNECTED_KEY = 'gdrive_connected';

/**
 * Checks if there is an active Google Drive session.
 * Detects persistent OAuth tokens, connection flags in storage,
 * active Firebase Auth credentials with Google provider, or runtime globals.
 */
export const checkHasActiveGoogleDriveSession = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;

    // 1. Storage checks
    const localToken = localStorage.getItem(DRIVE_TOKEN_KEY);
    const sessionToken = sessionStorage.getItem(DRIVE_TOKEN_KEY);
    const localConnected = localStorage.getItem(DRIVE_CONNECTED_KEY) === 'true';
    const sessionConnected = sessionStorage.getItem(DRIVE_CONNECTED_KEY) === 'true';

    if (localToken || sessionToken || localConnected || sessionConnected) {
      return true;
    }

    // 2. Global runtime hook
    if ((window as any).__GOOGLE_DRIVE_ACTIVE__ === true) {
      return true;
    }

    // 3. Firebase Auth provider check
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      const hasGoogle = user.providerData?.some(p => p.providerId === 'google.com');
      if (hasGoogle) return true;
    }
  } catch (err) {
    console.warn('Error checking Google Drive session:', err);
  }

  return false;
};

/**
 * Stores Google Drive session credentials across localStorage and sessionStorage.
 */
export const setGoogleDriveSession = (token: string): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DRIVE_TOKEN_KEY, token);
    localStorage.setItem(DRIVE_CONNECTED_KEY, 'true');
    sessionStorage.setItem(DRIVE_TOKEN_KEY, token);
    sessionStorage.setItem(DRIVE_CONNECTED_KEY, 'true');
    (window as any).__GOOGLE_DRIVE_ACTIVE__ = true;
  } catch (e) {
    console.warn('Error storing Google Drive session:', e);
  }
};

/**
 * Clears Google Drive session tokens and flags from persistent storage.
 */
export const clearGoogleDriveSession = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DRIVE_TOKEN_KEY);
    localStorage.removeItem(DRIVE_CONNECTED_KEY);
    sessionStorage.removeItem(DRIVE_TOKEN_KEY);
    sessionStorage.removeItem(DRIVE_CONNECTED_KEY);
    (window as any).__GOOGLE_DRIVE_ACTIVE__ = false;
  } catch (e) {
    console.warn('Error clearing Google Drive session:', e);
  }
};
