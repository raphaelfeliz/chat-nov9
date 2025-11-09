/* *file-summary*
PATH: src/components/chat/bubble-area/chat-bubble.tsx

PURPOSE: Renders a single chat message, correctly styled and positioned based on its `variant` (incoming, outgoing, or loading).

SUMMARY: This is a **dumb presentational component** that receives the message content and its `variant` via props. It uses conditional logic to determine the bubble's appearance and alignment:
- **'outgoing'**: Aligned to the right, styled for the user.
- **'incoming'** (or **'loading'**): Aligned to the left, styled for the assistant.
- **'loading'**: If the variant is `'loading'`, it suppresses the message text and renders the `FadingBlocksLoader` component instead, providing visual feedback that the AI is processing the request.

RELATES TO OTHER FILES:
- It is imported and utilized by 'src/components/chat/bubble-area/chat-bubble-area.tsx', which maps over the session's message history and renders each message using this component.
- It imports the specific loader component from './fading-blocks-loader.tsx' to handle the AI thinking state.

IMPORTS:
- React from 'react'
- FadingBlocksLoader from './fading-blocks-loader'

EXPORTS:
- default ChatBubble (React functional component)
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