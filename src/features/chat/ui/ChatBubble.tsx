/* *file-summary*
PATH: src/features/chat/ui/ChatBubble.tsx

PURPOSE: A "dumb" visual component to render a single chat message bubble.

SUMMARY: This component receives a full `ChatMessage` object.
         It renders a styled bubble based on the `message.variant`:
         - 'incoming': Standard bot reply.
         - 'outgoing': Standard user reply.
         - 'loading': Renders the `ChatLoader`.
         - 'whatsapp-link': Renders a clickable "Iniciar Conversa" button.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by `src/features/chat/ui/ChatDisplay.tsx`.
- It imports its child component, `src/features/chat/ui/ChatLoader.tsx`.

IMPORTS:
- React
- ChatLoader from './ChatLoader'
- ChatMessage from '@/core/persistence/types'
- MessageCircle from 'lucide-react'
*/

'use client';

import React from 'react';
// --- REFACTOR: Import from new 'ui' path ---
import { ChatLoader } from './ChatLoader';
import { type ChatMessage } from '@/core/persistence/types';
// --- NEW (Phase 3.3.3) ---
import { MessageCircle } from 'lucide-react'; // For WhatsApp button icon

// --- UPDATED (Phase 3.3.3) ---
// The component now takes the entire message object
interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { variant, text } = message;

  // --SECTION: STYLING LOGIC
  // Logic to determine bubble styling.
  // --- BUG FIX (Log 013) ---
  // Add 'whatsapp-link' to the 'isIncoming' check to fix alignment.
  const isIncoming = variant === 'incoming' || variant === 'loading' || variant === 'whatsapp-link';

  const bubbleClasses = isIncoming
    ? 'bg-[#14293D] text-white rounded-t-2xl rounded-br-2xl'
    : 'bg-[#36C0F2] text-[#0d1a26] rounded-t-2xl rounded-bl-2xl';

  const wrapperClasses = isIncoming ? 'flex justify-start' : 'flex justify-end';

  // --SECTION: RENDER LOGIC
  // Use a switch for cleaner, more maintainable render logic
  const renderContent = () => {
    switch (variant) {
      // Case 1: Loading
      case 'loading':
        return <ChatLoader />;
      
      // --- NEW (Phase 3.3.3) ---
      // Case 2: WhatsApp Link (The Green Button)
      case 'whatsapp-link':
        return (
          <a
            href={text} // The 'text' property now holds the URL
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Iniciar Conversa no WhatsApp
          </a>
        );

      // Case 3: Default (Incoming or Outgoing text)
      default:
        return <p className="text-sm">{text}</p>;
    }
  };

  return (
    <div className={wrapperClasses}>
      {/* --- BUG FIX (Log 013) ---
        * The 'whatsapp-link' variant renders as a full-width button,
        * so we remove the standard bubble padding/styles for it.
        */}
      <div 
        className={
          variant === 'whatsapp-link' 
          ? "w-full max-w-[75%]" 
          : `${bubbleClasses} p-4 max-w-[75%]`
        }
      >
        {renderContent()}
      </div>
    </div>
  );
}