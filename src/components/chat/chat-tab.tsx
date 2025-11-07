import React, { useState, useEffect } from 'react';
import ChatBubbleArea from './bubble-area/chat-bubble-area';
import FooterArea from './footer-area/footer-area';

// Keep local storage during transition (read/write), but also mirror to Firestore
import {
  createSession,
  saveSession,
  loadSession,
  ChatSession,
  ChatMessage,
} from '../../lib/chat-storage';

// Firestore write helper
import { saveMessage as saveMessageToFirestore } from '../../lib/firestore';

const ChatTab: React.FC = () => {
  const sessionId = 'default-chat-session';

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bootReady, setBootReady] = useState(false);

  // --- Bootstrap (local storage path) ---
  useEffect(() => {
    console.group('[ChatTab] mount bootstrap');
    try {
      console.log('sessionId =', sessionId);
      const loaded = loadSession(sessionId);
      console.log('loadSession() ->', loaded ? 'found' : 'null');

      if (loaded) {
        setSession(loaded);
        setMessages(loaded.messages ?? []);
        console.log('setSession + setMessages (loaded.messages.length =', loaded.messages?.length ?? 0, ')');
      } else {
        const created = createSession();
        created.sessionId = sessionId;
        saveSession(created);
        setSession(created);
        setMessages(created.messages ?? []);
        console.log('created new session + saved to localStorage');
      }
    } catch (e) {
      console.error('[ChatTab] bootstrap error:', e);
    } finally {
      setBootReady(true);
      console.groupEnd();
    }
  }, []);

  // --- Persist to local storage whenever messages change (transition period) ---
  useEffect(() => {
    if (!session) return;
    console.groupCollapsed('[ChatTab] messages changed');
    try {
      const updated: ChatSession = {
        ...session,
        messages,
        updatedAt: Date.now(),
      };
      saveSession(updated);
      setSession(updated);
      console.log('saveSession(updated), messages.length =', messages.length);
    } catch (e) {
      console.error('[ChatTab] saveSession error:', e);
    } finally {
      console.groupEnd();
    }
  }, [messages]);

  // --- Send path with verbose tracing ---
  const handleSendMessage = async (text: string) => {
    console.group('[ChatTab] handleSendMessage');
    try {
      if (!text || !text.trim()) {
        console.warn('ignored empty message');
        return;
      }
      if (!bootReady) {
        console.warn('send attempted before bootstrap complete');
      }

      const ts = Date.now();
      const optimistic: ChatMessage = {
        id: String(ts), // keep as string!
        sender: 'user',
        text,
        timestamp: ts,
        variant: 'outgoing',
      };

      // 1) Optimistic UI
      setMessages(prev => {
        const next = [...prev, optimistic];
        console.log('optimistic UI appended; next.length =', next.length, 'id =', optimistic.id);
        return next;
      });

      // 2) Firestore mirror
      console.time('[ChatTab] saveMessageToFirestore');
      console.log('calling saveMessageToFirestore with', { sessionId, ts, textLen: text.length });
      await saveMessageToFirestore(sessionId, 'user', text, { timestamp: ts });
      console.timeEnd('[ChatTab] saveMessageToFirestore');
      console.log('Firestore write done');
    } catch (err) {
      console.error('[ChatTab] Firestore save failed:', err);
    } finally {
      console.groupEnd();
    }
  };

  // Do NOT coerce ids to numbers; pass through as string
  const formattedMessages = messages;

  return (
    <div className="bg-[#0d1a26] flex flex-col h-[80vh] text-white">
      <ChatBubbleArea messages={formattedMessages} />
      <FooterArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatTab;
