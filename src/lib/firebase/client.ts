import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { CLOUD_SYNC_ENABLED } from "../../constants/firebase";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

function hasCompleteFirebaseConfig(config: FirebaseConfig): boolean {
  return Object.values(config).every((value) => value.trim().length > 0);
}

function initializeFirebaseApp(): FirebaseApp | null {
  if (!CLOUD_SYNC_ENABLED) {
    return null;
  }

  const config = readFirebaseConfig();
  if (!hasCompleteFirebaseConfig(config)) {
    console.warn("Firebase is enabled but config is incomplete.");
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0] ?? null;
  }

  return initializeApp(config);
}

export const firebaseApp = initializeFirebaseApp();
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseFirestore = firebaseApp ? getFirestore(firebaseApp) : null;
