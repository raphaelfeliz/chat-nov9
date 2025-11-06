'use client';

// --- TYPE DEFINITIONS ---
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

// --- IMPLEMENTATION ---

/**
 * Creates a new chat session object.
 */
export function createSession(): ChatSession {
  const now = Date.now();
  // Temporary solution for environments where crypto.randomUUID is not available
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

/**
 * Saves the chat session to localStorage.
 */
export function saveSession(session: ChatSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(session.sessionId, JSON.stringify(session));
  }
}

/**
 * Loads a chat session from localStorage.
 */
export function loadSession(sessionId: string): ChatSession | null {
  if (typeof window !== 'undefined') {
    const sessionJSON = localStorage.getItem(sessionId);
    if (sessionJSON) {
      return JSON.parse(sessionJSON) as ChatSession;
    }
  }
  return null;
}
