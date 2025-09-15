import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase is not properly configured. Please set up your .env.local file.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  if (!auth) {
    throw new Error('Firebase is not properly configured. Please set up your .env.local file.');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  if (!auth) {
    console.warn('Firebase auth not available, calling callback with null user');
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback);
};
