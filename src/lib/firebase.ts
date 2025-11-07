/*
*file-summary*
PATH: src/lib/firebase.ts
PURPOSE: Initialize Firebase and configure Firestore with offline persistence for chat message storage.
SUMMARY: Creates a singleton Firebase app instance, connects to Firestore, and enables IndexedDB-based persistence
         for offline caching and queued writes. Automatically falls back to multi-tab mode when necessary.
IMPORTS: firebase/app, firebase/firestore
EXPORTS: app (Firebase app), db (Firestore instance)
*/

// --- Core Firebase imports ---
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";

// --- Firebase Web App configuration (verified) ---
const firebaseConfig = {
  apiKey: "AIzaSyCLNDy7urRAxaoXxxRqaSvklt-CAh-nNMU",
  authDomain: "gen-lang-client-0545699517.firebaseapp.com",
  projectId: "gen-lang-client-0545699517",
  storageBucket: "gen-lang-client-0545699517.firebasestorage.app",
  messagingSenderId: "253278659379",
  appId: "1:253278659379:web:ab51004201ffa98fb5d446",
};

// --- Initialize Firebase and Firestore ---
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Enable offline persistence (IndexedDB) ---
(async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("[firebase] ✅ Persistence: single-tab IndexedDB enabled");
  } catch (e: any) {
    if (e?.code === "failed-precondition") {
      console.warn("[firebase] IndexedDB lock detected, trying multi-tab mode...");
      try {
        await enableMultiTabIndexedDbPersistence(db);
        console.log("[firebase] ✅ Persistence: multi-tab IndexedDB enabled");
      } catch (e2) {
        console.error("[firebase] ❌ Multi-tab persistence failed:", e2);
      }
    } else if (e?.code === "unimplemented") {
      console.warn("[firebase] ⚠️ Persistence not supported in this browser");
    } else {
      console.error("[firebase] ❌ Unexpected persistence error:", e);
    }
  }
})();
