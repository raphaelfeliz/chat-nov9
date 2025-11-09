/* *file-summary*
PATH: src/features/chat/ui/ChatInput.tsx

PURPOSE: A "dumb" visual component for the chat input field and send button.

SUMMARY: This is a controlled component that receives an `onSendMessage`
         callback and an `isLoading` boolean. The `isLoading` prop
         disables the input and button while the AI is processing.
         It manages its own internal text state.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/chat/ChatCoPilot.tsx`.

IMPORTS:
- React (useState)
- lucide-react (Send icon)
*/

'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    // Don't send if already loading or if input is empty
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't send on Enter if already loading
    if (event.key === 'Enter' && !isLoading) {
      handleSendClick();
    }
  };

  return (
    <div className="p-4 bg-[#14293D]">
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder={isLoading ? 'processando...' : 'digite aqui'}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading} // Disable input when loading
          className="flex-1 bg-[#0d1a26] rounded-full py-3 px-5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36C0F2] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={handleSendClick}
          disabled={isLoading} // Disable button when loading
          className="flex-shrink-0 bg-[#36C0F2] text-[#0d1a26] rounded-full h-12 w-12 flex items-center justify-center hover:bg-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#36C0F2] focus:ring-offset-2 focus:ring-offset-[#14293D] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}