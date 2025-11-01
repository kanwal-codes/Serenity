import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your web app's Firebase configuration
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Check if we have a valid API key
const hasValidApiKey = Boolean(
  (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith("AIza")) ||
  (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza"))
);

// Initialize Firebase
let app;
let auth;
let googleProvider;
let db;

if (!hasValidApiKey) {
  console.warn('Firebase API key is not valid or missing. Please check your .env.local file.');
  console.log('To get your API key:');
  console.log('1. Go to https://console.firebase.google.com');
  console.log('2. Select your project "Serenity"');
  console.log('3. Go to Project Settings > General > Your apps');
  console.log('4. Copy the API key from your web app config');
  auth = null;
  googleProvider = null;
  db = null;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    console.log('Firebase initialized successfully!');
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
    console.log('Please check your Firebase configuration in .env.local');
    auth = null;
    googleProvider = null;
    db = null;
  }
}

export { auth, googleProvider, db };
export default app;
