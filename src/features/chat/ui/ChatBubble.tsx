/* *file-summary*
PATH: src/features/chat/ui/ChatBubble.tsx

PURPOSE: A "dumb" visual component to render a single chat message bubble.

SUMMARY: This component receives the message text and a `variant`
         ('incoming', 'outgoing', 'loading'). It applies different styles
         based on the variant. If the variant is 'loading', it renders
         the `ChatLoader` component instead of text.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by `src/features/chat/ui/ChatDisplay.tsx`.
- It imports its child component, `src/features/chat/ui/ChatLoader.tsx`.

IMPORTS:
- React
- ChatLoader from './ChatLoader'
*/

'use client';

import React from 'react';
// --- REFACTOR: Import from new 'ui' path ---
import { ChatLoader } from './ChatLoader';
import { type ChatMessage } from '@/core/persistence/types';

interface ChatBubbleProps {
  message: string;
  variant: ChatMessage['variant'];
}

export function ChatBubble({ message, variant }: ChatBubbleProps) {
  // Logic to determine bubble styling.
  // The 'loading' variant shares styling with the 'incoming' variant.
  const isIncoming = variant === 'incoming' || variant === 'loading';

  const bubbleClasses = isIncoming
    ? 'bg-[#14293D] text-white rounded-t-2xl rounded-br-2xl'
    : 'bg-[#36C0F2] text-[#0d1a26] rounded-t-2xl rounded-bl-2xl';

  const wrapperClasses = isIncoming ? 'flex justify-start' : 'flex justify-end';

  return (
    <div className={wrapperClasses}>
      <div className={`${bubbleClasses} p-4 max-w-[75%]`}>
        {/* Render the loader if variant is 'loading', otherwise render text. */}
        {variant === 'loading' ? (
          <ChatLoader />
        ) : (
          <p className="text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}