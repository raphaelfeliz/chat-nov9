
import React, { useState, useEffect } from 'react';
import ChatBubbleArea from './bubble-area/chat-bubble-area';
import FooterArea from './footer-area/footer-area';
import {
  createSession,
  saveSession,
  loadSession,
  ChatSession,
  ChatMessage,
} from '../../lib/chat-storage';

const ChatTab: React.FC = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const sessionId = 'default-chat-session';
    let loadedSession = loadSession(sessionId);

    if (loadedSession) {
      setSession(loadedSession);
      setMessages(loadedSession.messages);
    } else {
      const newSession = createSession();
      newSession.sessionId = sessionId; 
      saveSession(newSession);
      setSession(newSession);
      setMessages(newSession.messages);
    }
  }, []);

  useEffect(() => {
    if (session) {
      const updatedSession = {
        ...session,
        messages: messages,
        updatedAt: Date.now(),
      };
      saveSession(updatedSession);
      setSession(updatedSession);
    }
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
      variant: 'outgoing',
    };
    setMessages([...messages, newMessage]);
  };

  const formattedMessages = messages.map(message => ({...message, id: Number(message.id)}));

  return (
    <div className="bg-[#0d1a26] flex flex-col h-[80vh] text-white">
      <ChatBubbleArea messages={formattedMessages} />
      <FooterArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatTab;
