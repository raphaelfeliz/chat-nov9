/* *file-summary*
PATH: src/core/persistence/types.ts

PURPOSE: To define and export all shared data types for chat persistence.

SUMMARY: This file acts as the single source of truth for persistence-related
         data structures. It ensures that the chat feature and the persistence
         layer (chatHistory.ts) use the exact same object shapes.

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
    variant: 'incoming' | 'outgoing' | 'loading';
  };
  
  /**
   * Defines the structure for a complete chat session, which
   * contains an array of messages and metadata.
   */
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