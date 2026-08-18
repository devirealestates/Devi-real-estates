import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCeM9qLBU7BevplyqW9m6u9KJHKzfe4DNc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devirealestates-a550f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devirealestates-a550f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devirealestates-a550f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "33925963339",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:33925963339:web:674ffbb087ccb83d4477ce",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7Z40DM1T6Q"
};

// Official Firebase VAPID Public Key for Web Push Certificates
export const FCM_VAPID_KEY =
  import.meta.env.VITE_FCM_VAPID_KEY ||
  'BGkbUt3PqmghdTLfY4u70apQ0kGBNEG0oGKAIpzY8H5jg6-XMvfJnS4JQMFEiR4Z76seb0Lz9eNYJOzLNHhRwxI';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Messaging safely
let messagingInstance: Messaging | null = null;

export const getFCMInstance = async (): Promise<Messaging | null> => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  }
  return null;
};

export default app;
