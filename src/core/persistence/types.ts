/* *file-summary*
PATH: src/core/persistence/types.ts

PURPOSE: To define and export all shared data types for chat persistence.

SUMMARY: This file acts as the single source of truth for persistence-related
         data structures. It defines the `ChatMessage` type for individual
         messages and the `ChatSession` type for the parent document,
         which now includes fields for storing user contact info.

RELATES TO OTHER FILES:
- This file is imported by `src/core/persistence/chatHistory.ts`.
- It is also imported by `src/features/chat/ChatCoPilot.tsx` to
  type its local message state.

IMPORTS:
- None
*/

/**
 * Defines the structure for a single chat message, including the
 * 'loading' variant used for optimistic UI.
 */
export type ChatMessage = {
    id: string;
    sender: 'user' | 'bot' | 'assistant';
    text: string;
    timestamp: number;
    // --- UPDATED (Phase 3.3.2) ---
    // Added 'whatsapp-link' to support the new button bubble
    variant: 'incoming' | 'outgoing' | 'loading' | 'whatsapp-link';
  };
  
  /**
   * Defines the structure for a complete chat session, which
   * contains an array of messages and metadata.
   */
  export type ChatSession = {
    sessionId: string;
    createdAt: number;
    updatedAt: number;
    messages: ChatMessage[]; // Note: This is client-side only, not stored in the doc
    meta: {
      version: number;
      device: 'web';
    };
    // --- NEW (Phase 2.2.1) ---
    // User contact info, stored on the parent session document
    userName?: string | null;
    userEmail?: string | null;
    userPhone?: string | null;
  };