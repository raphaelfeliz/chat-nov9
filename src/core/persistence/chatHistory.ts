/* *file-summary*
PATH: src/core/persistence/chatHistory.ts

PURPOSE: To centralize all database read/write interactions for chat history.

SUMMARY: This file abstracts all Firestore logic for the chat feature.
         It provides functions to load/save the parent session (contact info)
         and the messages subcollection. The `saveMessage` function now
         accepts and stores the message `variant` to ensure UI
         consistency on reload (e.g., for 'whatsapp-link' bubbles).
         It also includes `loadAllSessionSummaries` for the admin panel.

RELATES TO OTHER FILES:
- Imports the `db` instance from `./firebase.ts`.
- Imports types from `./types.ts`.
- This file is imported by `src/features/chat/ChatCoPilot.tsx` to
  load and save its messages.
- This file is imported by `src/app/(admin)/admin/page.tsx` to
  load all session data.

IMPORTS:
- db from './firebase'
- ChatMessage, ChatSession from './types'
- firebase/firestore functions
*/

'use client';

// --- REFACTOR: Import db from new 'core' path ---
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  // --- NEW (Phase 2.2.2) ---
  // Import functions for parent document operations
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
// --- REFACTOR: Import types from new 'core' path ---
import { type ChatMessage, type ChatSession } from './types';

// --SECTION: HELPER FUNCTIONS

/**
 * 🛟 --- FIX ---
 * Helper function to safely convert a Firestore timestamp into a number.
 * It handles both new Timestamp objects (with .toMillis()) and
 * old 'poisoned' data that was stored as a plain JS number.
 */
function normalizeTimestamp(timestamp: any): number {
  // Case 1: It's a valid Firestore Timestamp object
  if (timestamp && typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }
  // Case 2: It's already a plain number
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  // Case 3: It's missing or invalid, return now as a fallback
  return Date.now();
}

// --SECTION: CHAT SESSION (PARENT DOCUMENT) LOGIC

/**
 * Loads a chat session from Firestore.
 * This now loads the PARENT document and its MESSAGES subcollection.
 */
export async function loadSession(
  sessionId: string
): Promise<ChatSession | null> {
  console.groupCollapsed(`[chatHistory] loadSession (${sessionId})`);
  try {
    // 1. Get the parent session document
    const sessionRef = doc(db, 'chats', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      console.info('[chatHistory] No session document found in Firestore.');
      console.groupEnd();
      return null;
    }

    // 2. Get the messages from the subcollection
    const messagesQuery = query(
      collection(db, 'chats', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    const messages: ChatMessage[] = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        sender: data.sender,
        text: data.text,
        timestamp: normalizeTimestamp(data.timestamp),
        // --- 🛟 BUG FIX: Load the variant from DB ---
        // 1. Try to read the saved variant.
        // 2. If it's missing (old message), fall back to the old logic.
        variant:
          data.variant || (data.sender === 'user' ? 'outgoing' : 'incoming'),
      } as ChatMessage;
    });

    // 3. Merge the session data and messages
    const sessionData = sessionSnap.data();
    const session: ChatSession = {
      sessionId: sessionSnap.id,
      createdAt: sessionData.createdAt || Date.now(),
      updatedAt: sessionData.updatedAt || Date.now(),
      meta: sessionData.meta || { version: 1, device: 'web' },
      // Add contact info
      userName: sessionData.userName || null,
      userEmail: sessionData.userEmail || null,
      userPhone: sessionData.userPhone || null,
      // Add messages (which are not stored on the parent doc)
      messages: messages,
    };

    console.info(
      `[chatHistory] ✅ Loaded session and ${messages.length} messages from Firestore (cached or live)`
    );
    console.groupEnd();
    return session;
  } catch (err) {
    console.error('[chatHistory] ❌ Firestore load error:', err);
    console.groupEnd();
    return null;
  }
}

/**
 * Creates the initial parent session document in Firestore.
 */
export async function saveInitialSession(session: ChatSession): Promise<void> {
  const { messages, ...sessionData } = session; // Separate messages from session data
  const sessionRef = doc(db, 'chats', session.sessionId);
  try {
    // This creates the document `chats/{sessionId}`
    await setDoc(sessionRef, sessionData);
  } catch (e) {
    console.error('[chatHistory] ❌ Error creating initial session document: ', e);
  }
}

/**
 * Updates the contact info on the parent session document.
 */
export async function updateSessionContactInfo(
  sessionId: string,
  contactData: {
    userName?: string;
    userEmail?: string;
    userPhone?: string;
  }
): Promise<void> {
  const sessionRef = doc(db, 'chats', sessionId);
  try {
    // Use setDoc with merge: true to create or update fields
    // without overwriting the whole document.
    await setDoc(sessionRef, contactData, { merge: true });
  } catch (e) {
    console.error('[chatHistory] ❌ Error updating contact info: ', e);
  }
}

/**
 * --- NEW (Admin Panel) ---
 * Loads a summary of all chat sessions for the admin panel.
 * Does NOT load the 'messages' subcollection.
 */
export async function loadAllSessionSummaries(): Promise<ChatSession[]> {
  try {
    const sessionsQuery = query(
      collection(db, 'chats'),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(sessionsQuery);

    const sessions: ChatSession[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        sessionId: doc.id,
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt),
        meta: data.meta || { version: 1, device: 'web' },
        userName: data.userName || null,
        userEmail: data.userEmail || null,
        userPhone: data.userPhone || null,
        messages: [], // Message list is intentionally empty
      } as ChatSession;
    });

    return sessions;
  } catch (err) {
    console.error('[chatHistory] ❌ Firestore admin load error:', err);
    return [];
  }
}

// --SECTION: CHAT MESSAGES (SUBCOLLECTION) LOGIC

/**
 * Saves a single chat message to the 'messages' subcollection.
 * --- 🛟 BUG FIX: Now accepts a data object to include the 'variant'.
 */
export async function saveMessage(
  sessionId: string,
  messageData: {
    sender: 'user' | 'bot' | 'assistant';
    text: string;
    variant: ChatMessage['variant'];
  }
): Promise<string | null> {
  try {
    // This saves to `chats/{sessionId}/messages/{messageId}`
    const docRef = await addDoc(
      collection(db, 'chats', sessionId, 'messages'),
      {
        sender: messageData.sender,
        text: messageData.text,
        variant: messageData.variant, // <-- THE FIX: Save the variant
        timestamp: Timestamp.now(), // Use Firestore server timestamp
      }
    );
    return docRef.id;
  } catch (e) {
    console.error('[chatHistory] ❌ Error adding document: ', e);
    return null;
  }
}

// --SECTION: LOCAL SESSION CREATION

/**
 * Helper to create a new chat session template (in-memory).
 */
export function createSession(): ChatSession {
  const now = Date.now();
  const sessionId = `${now}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    sessionId,
    createdAt: now,
    updatedAt: now,
    messages: [], // Starts empty
    meta: {
      version: 1,
      device: 'web',
    },
    // --- NEW (Phase 2.2.2) ---
    // Initialize new fields
    userName: null,
    userEmail: null,
    userPhone: null,
  };
}