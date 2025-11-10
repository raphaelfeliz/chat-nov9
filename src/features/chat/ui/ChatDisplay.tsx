/* *file-summary*
PATH: src/features/chat/ui/ChatDisplay.tsx

PURPOSE: A "dumb" visual component to render the scrollable message display area.

SUMMARY: This component maps over the provided `messages` array and renders each
         as a `ChatBubble` component. It includes a `useEffect` hook that
         auto-scrolls the view to the bottom (to the `messagesEndRef`)
         whenever the 'messages' prop is updated. This file was updated
         to pass the correct 'message' object prop to its child.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/chat/ChatCoPilot.tsx`.
- It imports its child component, `src/features/chat/ui/ChatBubble.tsx`.
- It uses the `ChatMessage` type from `src/core/persistence/types.ts`.

IMPORTS:
- React (useRef, useEffect)
- ChatBubble from './ChatBubble'
- type ChatMessage from '@/core/persistence/types'
*/

'use client';

// --- REFACTOR: Import hooks from React ---
import React, { useRef, useEffect } from 'react';

// --- REFACTOR: Import from new 'ui' path ---
import { ChatBubble } from './ChatBubble';

// --- REFACTOR: Import type from new 'core' path ---
import { type ChatMessage } from '@/core/persistence/types';

interface ChatDisplayProps {
  messages: ChatMessage[];
}

export function ChatDisplay({ messages = [] }: ChatDisplayProps) {
  // --- Create a ref to attach to the bottom of the chat list ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- This effect runs every time the 'messages' array changes. ---
  // It smoothly scrolls the chat view to the 'messagesEndRef' (the bottom).
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {(messages ?? []).map((msg) => (
        // --- BUG FIX ---
        // Pass the *entire* 'msg' object as the 'message' prop,
        // as required by the new ChatBubble component.
        <ChatBubble
          key={String(msg.id)}
          message={msg}
        />
      ))}
      {/* --- This empty div acts as the "anchor" for the auto-scroll ref --- */}
      <div ref={messagesEndRef} />
    </div>
  );
}