
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCeM9qLBU7BevplyqW9m6u9KJHKzfe4DNc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devirealestates-a550f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devirealestates-a550f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devirealestates-a550f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "33925963339",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:33925963339:web:674ffbb087ccb83d4477ce",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7Z40DM1T6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Add debugging for connection status
console.log('Firebase initialized successfully');
console.log('Auth instance:', auth);
console.log('Firestore instance:', db);
console.log('Project ID:', firebaseConfig.projectId);

export default app;
