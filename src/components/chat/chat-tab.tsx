/*
*file-summary*
PATH: src/components/chat/chat-tab.tsx
PURPOSE: Manage chat session lifecycle, user input, and message rendering using Firestore as the single source of truth.
SUMMARY: Initializes the chat session directly from Firestore (with IndexedDB cache support),
         gracefully falling back to legacy localStorage once for recovery.
         Handles optimistic message appends, mirrored Firestore writes, and automatic cache replay offline.
IMPORTS: React, ChatBubbleArea, FooterArea, chat-storage (createSession, saveSession, loadSession),
         firestore helpers (saveMessage)
EXPORTS: ChatTab (React functional component)
*/

'use client';

import React, { useState, useEffect } from 'react';
import ChatBubbleArea from './bubble-area/chat-bubble-area';
import FooterArea from './footer-area/footer-area';

// --- Persistence modules ---
import {
  createSession,
  saveSession,
  loadSession,
  ChatSession,
  ChatMessage,
} from '../../lib/chat-storage';
import {
  saveMessage as saveMessageToFirestore,
} from '../../lib/firestore';

/*
SECTION: FIRESTORE-FIRST BOOTSTRAP
PURPOSE: Load or create chat session using Firestore as the main source (IndexedDB cache supported).
DETAILS: Attempts Firestore read first (auto-resolves offline); falls back to localStorage only if Firestore empty.
*/
const ChatTab: React.FC = () => {
  const sessionId = 'default-chat-session';

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bootReady, setBootReady] = useState(false);

  // --- BOOTSTRAP (Firestore-first with fallback) ---
  useEffect(() => {
    console.group('[ChatTab] mount bootstrap');
    (async () => {
      try {
        console.log('sessionId =', sessionId);
        const loaded = await loadSession(sessionId);

        if (loaded) {
          setSession(loaded);
          setMessages(loaded.messages ?? []);
          console.log(`[ChatTab] loaded ${loaded.messages.length} messages from Firestore/local cache`);
        } else {
          const created = createSession();
          created.sessionId = sessionId;
          saveSession(created);
          setSession(created);
          setMessages([]);
          console.log('[ChatTab] created new session (empty)');
        }
      } catch (e) {
        console.error('[ChatTab] bootstrap error:', e);
      } finally {
        setBootReady(true);
        console.groupEnd();
      }
    })();
  }, []);

  /*
  SECTION: LOCAL MIRROR (DEPRECATED)
  PURPOSE: Maintain backward compatibility and logging for legacy localStorage writes.
  DETAILS: Updates are logged but Firestore is the authoritative store.
  */
  useEffect(() => {
    if (!session) return;
    console.groupCollapsed('[ChatTab] messages changed');
    try {
      const updated: ChatSession = { ...session, messages, updatedAt: Date.now() };
      saveSession(updated);
      setSession(updated);
      console.log('saveSession(updated), messages.length =', messages.length);
    } catch (e) {
      console.error('[ChatTab] saveSession error:', e);
    } finally {
      console.groupEnd();
    }
  }, [messages]);

  /*
  SECTION: MESSAGE SEND HANDLER
  PURPOSE: Handle outgoing messages with optimistic UI updates and Firestore mirroring.
  DETAILS: Appends message immediately, queues Firestore write (auto-synced offline if network unavailable).
  */
  const handleSendMessage = async (text: string) => {
    console.group('[ChatTab] handleSendMessage');
    try {
      if (!text?.trim()) {
        console.warn('ignored empty message');
        return;
      }
      if (!bootReady) console.warn('send attempted before bootstrap complete');

      const ts = Date.now();
      const optimistic: ChatMessage = {
        id: String(ts),
        sender: 'user',
        text,
        timestamp: ts,
        variant: 'outgoing',
      };

      // 1) Optimistic UI append
      setMessages((prev) => {
        const next = [...prev, optimistic];
        console.log('optimistic append → next.length =', next.length, 'id =', optimistic.id);
        return next;
      });

      // 2) Firestore mirror (auto-persisted offline if network down)
      console.time('[ChatTab] saveMessageToFirestore');
      await saveMessageToFirestore(sessionId, 'user', text, { timestamp: ts });
      console.timeEnd('[ChatTab] saveMessageToFirestore');
      console.log('Firestore write completed');
    } catch (err) {
      console.error('[ChatTab] Firestore save failed:', err);
    } finally {
      console.groupEnd();
    }
  };

  /*
  SECTION: UI RENDER
  PURPOSE: Display message area and input footer.
  DETAILS: ChatBubbleArea renders message list; FooterArea handles message sending.
  */
  return (
    <div className="bg-[#0d1a26] flex flex-col h-[80vh] text-white">
      <ChatBubbleArea messages={messages ?? []} />
      <FooterArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatTab;
