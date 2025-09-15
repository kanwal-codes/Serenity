import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your web app's Firebase configuration
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBwsVIWL-mnUx8f3Wc_Sk21W4gSOjcqHjA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "serenity-b0dcd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "serenity-b0dcd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "serenity-b0dcd.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "557349559606",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:557349559606:web:f54751acfe27eb00286797",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MQEK22VB0Y"
};

// Check if we have a valid API key
const hasValidApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith("AIza") ||
  firebaseConfig.apiKey.startsWith("AIza");

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
