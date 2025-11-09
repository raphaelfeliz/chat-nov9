/*
*file-summary*
PATH: src/components/chat/bubble-area/chat-bubble-area.tsx
PURPOSE: Render the scrollable message display area for the chat interface.
SUMMARY: Maps over the provided message array and renders each as a ChatBubble component.
         **NEW**: Now includes a useEffect hook that auto-scrolls the view
         to the bottom whenever the 'messages' prop is updated.
IMPORTS: React, ChatBubble (from ./chat-bubble)
EXPORTS: ChatBubbleArea (React functional component)
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