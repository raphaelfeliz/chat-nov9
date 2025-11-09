/*
*file-summary*
PATH: src/components/chat/bubble-area/chat-bubble.tsx
PURPOSE: Render a single chat bubble (one message), styled by variant.
SUMMARY: Stateless presentational component used by ChatBubbleArea to display
         an individual message.
         **NEW**: Now renders a <FadingBlocksLoader /> component
         if the message variant is 'loading'.
IMPORTS: React, FadingBlocksLoader
EXPORTS: ChatBubble (default)
*/

import React from 'react';
// --- MODIFICATION ---
// Import the new loading animation component
import FadingBlocksLoader from './fading-blocks-loader';

interface ChatBubbleProps {
  message: string;
  // --- MODIFICATION ---
  // Add the 'loading' variant to the type
  variant: 'incoming' | 'outgoing' | 'loading';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, variant }) => {
  // --- MODIFICATION ---
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
        {/* --- MODIFICATION --- */}
        {/* Render the loader if variant is 'loading', otherwise render text. */}
        {variant === 'loading' ? (
          <FadingBlocksLoader />
        ) : (
          <p className="text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;