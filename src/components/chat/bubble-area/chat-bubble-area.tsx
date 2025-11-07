/*
*file-summary*
PATH: src/components/chat/bubble-area/chat-bubble-area.tsx
PURPOSE: Render the scrollable message display area for the chat interface.
SUMMARY: Maps over the provided message array and renders each as a ChatBubble component,
         distinguishing between incoming and outgoing variants for visual alignment.
         Handles both numeric and string message IDs, ensuring stable React keys.
IMPORTS: React, ChatBubble (from ./chat-bubble)
EXPORTS: ChatBubbleArea (React functional component)
*/

import React from 'react';
import ChatBubble from './chat-bubble';

type Variant = 'incoming' | 'outgoing';

interface Message {
  id: string | number;     // allow Firestore string IDs and legacy numeric IDs
  text: string;
  variant: Variant;
}

interface ChatBubbleAreaProps {
  messages?: Array<Message | { id: string | number; text: string; variant: Variant; [key: string]: any }>;
}

const ChatBubbleArea: React.FC<ChatBubbleAreaProps> = ({ messages = [] }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {(messages ?? []).map((msg) => (
        <ChatBubble key={String(msg.id)} message={msg.text} variant={msg.variant} />
      ))}
    </div>
  );
};

export default ChatBubbleArea;
