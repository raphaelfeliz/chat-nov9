/*
*file-summary*
PATH: src/lib/chat-storage.ts
PURPOSE: Unified chat persistence layer with Firestore-first reads and legacy localStorage fallback.
SUMMARY: Uses Firestore as the authoritative data source, leveraging its offline cache.
         Falls back to localStorage only if Firestore is unavailable or empty.
IMPORTS: firebase/firestore (collection, getDocs, query, orderBy), localStorage (fallback only)
EXPORTS: createSession, saveSession (disabled), loadSession (Firestore-first)
*/

'use client';

import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/*
IMPLEMENTATION
PURPOSE: Define chat message and session types.
HOW: Include metadata for client environment and schema versioning.
*/
export type ChatMessage = {
  id: string;
  sender: 'user' | 'bot';
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
PURPOSE: Create new session template.
HOW: Generate sessionId from timestamp + random suffix; initialize metadata.
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
PURPOSE: Disable local writes.
HOW: Replace setItem() with console notice to confirm deprecation.
*/
export function saveSession(session: ChatSession) {
  if (typeof window !== 'undefined') {
    console.log('[chat-storage] saveSession disabled; using Firestore instead');
  }
}

/*
IMPLEMENTATION
PURPOSE: Firestore-first session loader with IndexedDB cache fallback.
HOW: Query Firestore for session messages; fallback to localStorage only if Firestore is empty.
*/
export async function loadSession(sessionId: string): Promise<ChatSession | null> {
  console.group('[chat-storage] loadSession (Firestore-first)');
  try {
    const q = query(collection(db, 'chats', sessionId, 'messages'), orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const messages: ChatMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ChatMessage),
      }));

      const session: ChatSession = {
        sessionId,
        createdAt: messages[0]?.timestamp ?? Date.now(),
        updatedAt: messages[messages.length - 1]?.timestamp ?? Date.now(),
        messages,
        meta: { version: 1, device: 'web' },
      };

      console.log(`[chat-storage] loaded ${messages.length} messages from Firestore`);
      console.groupEnd();
      return session;
    }

    console.warn('[chat-storage] Firestore returned empty; checking localStorage fallback...');
    const legacy = localStorage.getItem(sessionId);
    if (legacy) {
      console.warn('[chat-storage] ⚠ Using legacy localStorage fallback');
      console.groupEnd();
      return JSON.parse(legacy) as ChatSession;
    }

    console.groupEnd();
    return null;
  } catch (err) {
    console.error('[chat-storage] loadSession Firestore error:', err);
    console.groupEnd();
    return null;
  }
}
