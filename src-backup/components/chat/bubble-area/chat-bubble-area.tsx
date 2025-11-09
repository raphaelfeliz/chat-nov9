/* *file-summary*
PATH: src/components/chat/bubble-area/chat-bubble-area.tsx

PURPOSE: Renders the primary display area for all chat messages and implements auto-scrolling to the latest message.

SUMMARY: This is a **dumb display component** that takes an array of `messages` as a prop. It maps over this array, rendering each item as a `ChatBubble` component. The key feature of this component is its scroll management: it uses a `useRef` hook attached to an empty `div` at the bottom of the message list (`messagesEndRef`). A `useEffect` hook triggers `scrollIntoView({ behavior: 'smooth' })` every time the `messages` array updates (i.e., when a new message is sent or received), ensuring the newest message is always visible.

RELATES TO OTHER FILES:
- It is imported and utilized by 'src/components/chat/chat-tab.tsx', which manages the `messages` state and passes it down.
- It imports and renders the individual message component, './chat-bubble.tsx'.
- The message types it consumes align with the `ChatMessage` definition in '@/lib/chat-storage.ts'.

IMPORTS:
- React: useRef, useEffect
- ChatBubble from './chat-bubble'

EXPORTS:
- default ChatBubbleArea (React functional component)
*/

// --- MODIFICATION ---
// Import useRef and useEffect for the auto-scroll feature
import React, { useRef, useEffect } from 'react';
import ChatBubble from './chat-bubble';

// --- MODIFICATION ---
// Added 'loading' to the local Variant type to match the
// global ChatMessage type in chat-storage.ts.
type Variant = 'incoming' | 'outgoing' | 'loading';

interface Message {
  id: string | number; // allow Firestore string IDs and legacy numeric IDs
  text: string;
  variant: Variant;
}

interface ChatBubbleAreaProps {
  messages?: Array<Message | { id: string | number; text: string; variant: Variant; [key: string]: any }>;
}

const ChatBubbleArea: React.FC<ChatBubbleAreaProps> = ({ messages = [] }) => {
  // --- MODIFICATION ---
  // Create a ref to attach to the bottom of the chat list
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- MODIFICATION ---
  // This effect runs every time the 'messages' array changes.
  // It smoothly scrolls the chat view to the 'messagesEndRef' (the bottom).
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {(messages ?? []).map((msg) => (
        <ChatBubble key={String(msg.id)} message={msg.text} variant={msg.variant} />
      ))}
      {/* --- MODIFICATION --- */}
      {/* This empty div acts as the "anchor" for the auto-scroll ref */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBubbleArea;