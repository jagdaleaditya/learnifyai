import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

// Firebase config comes from .env (VITE_FIREBASE_* / VITE_GOOGLE_API_KEY), not from source code.
// Restrict the API key to your domains in Google Cloud Console → Credentials → HTTP referrers.
const e = import.meta.env;
const firebaseConfig = {
  apiKey: (e.VITE_FIREBASE_API_KEY || e.VITE_GOOGLE_API_KEY || '') as string,
  authDomain: (e.VITE_FIREBASE_AUTH_DOMAIN || 'learnify-f0a94.firebaseapp.com') as string,
  projectId: (e.VITE_FIREBASE_PROJECT_ID || 'learnify-f0a94') as string,
  storageBucket: (e.VITE_FIREBASE_STORAGE_BUCKET || 'learnify-f0a94.appspot.com') as string,
  messagingSenderId: (e.VITE_FIREBASE_MESSAGING_SENDER_ID || '277899891871') as string,
  appId: (e.VITE_FIREBASE_APP_ID || '1:277899891871:web:learnify') as string,
};
if (!firebaseConfig.apiKey) console.warn('Firebase API key missing: set VITE_GOOGLE_API_KEY in .env. Google sign-in will not work.');

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Force Google to show the account chooser popup (Choose an account)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      ok: true as const,
      user: {
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.photoURL || undefined
      }
    };
  } catch (error: any) {
    console.error('Firebase Google Sign-In error:', error);
    // If popup was blocked or closed by user
    return {
      ok: false as const,
      error: error.message || 'Failed to sign in with Google',
      code: error.code as string
    };
  }
}

export { signInWithRedirect, signOut };
