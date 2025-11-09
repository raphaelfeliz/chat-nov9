/* *file-summary*
PATH: src/core/persistence/firebase.ts

PURPOSE: To initialize and configure the connection to the Firebase/Firestore backend.

SUMMARY: This file initializes the Firebase app using environment variables
         and exports the Firestore database instance (`db`). It critically
         calls `enableIndexedDbPersistence` to ensure the chat
         history is cached locally, enabling robust offline-first capabilities.

RELATES TO OTHER FILES:
- This is the root of the persistence layer.
- The exported `db` instance is imported by `src/core/persistence/chatHistory.ts`
  to perform read/write operations.

IMPORTS:
- initializeApp from 'firebase/app'
- getFirestore, enableIndexedDbPersistence from 'firebase/firestore'
*/

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
// (It's safe to expose these keys, but use .env.local for best practice)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export the instance
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn(
      '[Firebase] Firestore offline persistence failed: Multiple tabs open?'
    );
  } else if (err.code === 'unimplemented') {
    console.warn(
      '[Firebase] Firestore offline persistence not available in this browser.'
    );
  }
});