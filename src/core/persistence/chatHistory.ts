/* *file-summary*
PATH: src/core/persistence/chatHistory.ts

PURPOSE: To centralize all database read/write interactions for chat history.

SUMMARY: This file abstracts all Firestore logic for the chat feature.
         It provides a function to load an entire session (read) and
         a function to save a single message (write). It imports the
         initialized `db` instance and the shared data types.

RELATES TO OTHER FILES:
- Imports the `db` instance from `./firebase.ts`.
- Imports types from `./types.ts`.
- This file is imported by `src/features/chat/ChatCoPilot.tsx` to
  load and save its messages.

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
} from 'firebase/firestore';
// --- REFACTOR: Import types from new 'core' path ---
import { type ChatMessage, type ChatSession } from './types';

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

/**
 * Loads a chat session from Firestore, prioritizing the offline cache.
 * (Logic from old chat-storage.ts)
 */
export async function loadSession(
  sessionId: string
): Promise<ChatSession | null> {
  console.groupCollapsed(`[chatHistory] loadSession (${sessionId})`);
  try {
    const q = query(
      collection(db, 'chats', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const messages: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          sender: data.sender,
          text: data.text,
          // --- FIX: Use the 'defensive' helper function ---
          timestamp: normalizeTimestamp(data.timestamp),
          variant: data.sender === 'user' ? 'outgoing' : 'incoming',
        } as ChatMessage;
      });

      const session: ChatSession = {
        sessionId,
        createdAt: messages[0]?.timestamp ?? Date.now(),
        updatedAt: messages[messages.length - 1]?.timestamp ?? Date.now(),
        messages,
        meta: { version: 1, device: 'web' },
      };

      console.info(
        `[chatHistory] ✅ Loaded ${messages.length} messages from Firestore (cached or live)`
      );
      console.groupEnd();
      return session;
    }

    // --- REFACTOR: Removed legacy localStorage fallback for simplicity ---
    console.info('[chatHistory] No data found in Firestore.');
    console.groupEnd();
    return null;
  } catch (err) {
    console.error('[chatHistory] ❌ Firestore load error:', err);
    console.groupEnd();
    return null;
  }
}

/**
 * Saves a single chat message to the Firestore database.
 * (Logic from old firestore.ts)
 */
export async function saveMessage(
  sessionId: string,
  sender: 'user' | 'bot' | 'assistant',
  text: string
): Promise<string | null> {
  try {
    const docRef = await addDoc(
      collection(db, 'chats', sessionId, 'messages'),
      {
        sender: sender,
        text: text,
        timestamp: Timestamp.now(), // Use Firestore server timestamp
      }
    );
    return docRef.id;
  } catch (e) {
    console.error('[chatHistory] ❌ Error adding document: ', e);
    return null;
  }
}

/**
 * Helper to create a new chat session template.
 * (Logic from old chat-storage.ts)
 */
export function createSession(): ChatSession {
  const now = Date.now();
  const sessionId = `${now}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    sessionId,
    createdAt: now,
    updatedAt: now,
    messages: [],
    meta: {
      version: 1,
      device: 'web',
    },
  };
}