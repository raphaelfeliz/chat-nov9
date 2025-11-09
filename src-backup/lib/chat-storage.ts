/* *file-summary*
PATH: src/lib/chat-storage.ts

PURPOSE: Manages the data structures and retrieval logic for chat history, establishing a Firestore-first persistence policy.

SUMMARY: This file defines the `ChatMessage` and `ChatSession` types used across the chat feature. The primary function, `loadSession`, implements the persistence strategy: it attempts to fetch ordered messages from the Firestore backend (which leverages IndexedDB for offline caching) using the provided `sessionId`. If the Firestore collection is non-empty, it reconstructs and returns the `ChatSession`. If Firestore is empty (or fails), it falls back to checking the deprecated `localStorage` key for legacy data before returning `null`. The `saveSession` function is stubbed out and logs a warning, enforcing the rule that all message writes must go through the dedicated Firestore functions (like `saveMessage` in `firestore.ts`) for centralized control and offline queuing.

RELATES TO OTHER FILES:
- **Database:** It imports the initialized Firestore instance `db` from './firebase.ts'.
- **Persistence Logic:** It uses Firebase SDK functions (`collection`, `query`, `getDocs`, `orderBy`) to interact with Firestore.
- **Consumer:** The exported `ChatMessage` and `ChatSession` types, along with the `loadSession` function, are imported and used by 'src/components/chat/chat-tab.tsx' during the application's bootstrap phase.

IMPORTS:
- db from './firebase'
- collection, getDocs, query, orderBy from 'firebase/firestore'

EXPORTS:
- type ChatMessage
- type ChatSession
- createSession (Function to create new session metadata)
- saveSession (Deprecated stub)
- loadSession (Firestore-first retrieval function)
*/

'use client';

import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/*
IMPLEMENTATION
PURPOSE: Define chat message and session structures.
HOW: Include metadata for version tracking and device context.
*/
export type ChatMessage = {
  id: string;
  sender: 'user' | 'bot' | 'assistant';
  text: string;
  timestamp: number;
  variant: 'incoming' | 'outgoing';
};

export type ChatSession = {
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  meta: {
    version: number;
    device: 'web';
  };
};

/*
IMPLEMENTATION
PURPOSE: Create a new chat session template.
HOW: Generate a unique sessionId using timestamp + random suffix.
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

/*
IMPLEMENTATION
PURPOSE: Disable local persistence to enforce Firestore-first policy.
HOW: Replaces storage writes with console notice for transparency.
*/
export function saveSession(_session: ChatSession) {
  if (typeof window !== 'undefined') {
    console.info('[chat-storage] saveSession disabled — Firestore handles persistence.');
  }
}

/*
IMPLEMENTATION
PURPOSE: Load session data, prioritizing Firestore with built-in IndexedDB cache.
HOW: Query ordered messages from Firestore; fallback to localStorage only if Firestore is empty.
*/
export async function loadSession(sessionId: string): Promise<ChatSession | null> {
  console.groupCollapsed(`[chat-storage] loadSession (${sessionId})`);
  try {
    const q = query(collection(db, 'chats', sessionId, 'messages'), orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const messages: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ChatMessage, 'id'>;
        return { id: doc.id, ...data };
      });

      const session: ChatSession = {
        sessionId,
        createdAt: messages[0]?.timestamp ?? Date.now(),
        updatedAt: messages[messages.length - 1]?.timestamp ?? Date.now(),
        messages,
        meta: { version: 1, device: 'web' },
      };

      console.info(`[chat-storage] ✅ Loaded ${messages.length} messages from Firestore (cached or live)`);
      console.groupEnd();
      return session;
    }

    console.warn('[chat-storage] Firestore returned empty; checking localStorage fallback...');
    const legacyData = localStorage.getItem(sessionId);
    if (legacyData) {
      console.warn('[chat-storage] ⚠ Using legacy localStorage fallback data');
      console.groupEnd();
      return JSON.parse(legacyData) as ChatSession;
    }

    console.info('[chat-storage] No data found in Firestore or localStorage.');
    console.groupEnd();
    return null;
  } catch (err) {
    console.error('[chat-storage] ❌ Firestore load error:', err);
    console.groupEnd();
    return null;
  }
}
