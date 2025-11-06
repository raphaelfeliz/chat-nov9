
import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface FooterAreaProps {
  onSendMessage: (text: string) => void;
}

const FooterArea: React.FC<FooterAreaProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendClick();
    }
  };

  return (
    <div className="p-4 bg-[#14293D]">
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="digite aqui"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-[#0d1a26] rounded-full py-3 px-5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#36C0F2] transition duration-200"
        />
        <button
          type="button"
          onClick={handleSendClick}
          className="flex-shrink-0 bg-[#36C0F2] text-[#0d1a26] rounded-full h-12 w-12 flex items-center justify-center hover:bg-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#36C0F2] focus:ring-offset-2 focus:ring-offset-[#14293D]"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FooterArea;
