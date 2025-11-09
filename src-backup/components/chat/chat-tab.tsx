/* *file-summary*
PATH: src/components/chat/chat-tab.tsx

PURPOSE: The central control component for the AI Chat Pillar (Pillar 2). It manages chat state, synchronizes with the Configurator, and orchestrates the AI request/response flow.

SUMMARY: This is a core **smart component** that ties the chat UI, persistence, and the "Smarter Brain" (Configurator Context) together.
1. **Bootstrap:** Loads chat history from Firestore (with local caching via `loadSession`).
2. **Context Listener:** Uses a `useEffect` to listen for changes in `currentQuestion` from the `ConfiguratorContext`. If a new question is required, it posts the question as a bot message and saves it to Firestore, while ensuring no question is posted if the flow is finished (`finalProducts` exists) or while the AI is loading.
3. **`handleSendMessage`:** This is the critical function for the AI flow:
    - It immediately posts the user's message and a `variant: 'loading'` bubble (optimistic UI).
    - It sends the user text to the `/api/chat` endpoint.
    - Upon receiving the AI's JSON "form," it implements the **"Answer-then-Question"** sequence:
        a. If `knowledgeBaseAnswer` exists, it atomically removes the `loading` bubble and posts the factual answer bubble, saving it to Firestore.
        b. It then calls `applyExtractedFacets(aiJson)` on the context. This triggers the Smarter Brain, which finds the *next* logical question, which is then posted by the `useEffect` listener (step 2), completing the sequence.
    - Errors and loading states are handled to ensure a clean UI transition.

RELATES TO OTHER FILES:
- **State Consumer:** Consumes `currentQuestion`, `finalProducts`, and `applyExtractedFacets` from 'src/context/ConfiguratorContext.tsx'.
- **Persistence:** Imports Firestore functions (`saveMessageToFirestore`) from '@/lib/firestore.ts' to ensure permanent, offline-first chat history.
- **AI Integration:** Sends requests to the Next.js API route 'src/app/api/chat/route.ts' and uses the type definition `ExtractedFacets` from '@/ai/genkit.ts'.
- **UI Composites:** Renders the chat UI by importing and passing state to its children: 'src/components/chat/bubble-area/chat-bubble-area.tsx' and 'src/components/chat/footer-area/footer-area.tsx'.

IMPORTS:
- React: useEffect, useState, useRef
- ChatBubbleArea from '@/components/chat/bubble-area/chat-bubble-area'
- FooterArea from '@/components/chat/footer-area/footer-area'
- type ChatSession, type ChatMessage, loadSession, createSession, saveSession from '@/lib/chat-storage'
- saveMessage as saveMessageToFirestore from '@/lib/firestore'
- useConfiguratorContext from '@/context/ConfiguratorContext'
- type ExtractedFacets from '@/ai/genkit'

EXPORTS:
- ChatTab (React functional component)
*/

'use client';

import React, { useEffect, useState, useRef } from 'react';
import ChatBubbleArea from '@/components/chat/bubble-area/chat-bubble-area';
import FooterArea from '@/components/chat/footer-area/footer-area';
import {
  createSession,
  saveSession,
  loadSession,
  type ChatSession,
  type ChatMessage,
} from '@/lib/chat-storage';
import { saveMessage as saveMessageToFirestore } from '@/lib/firestore';
import { useConfiguratorContext } from '@/context/ConfiguratorContext';
import { type ExtractedFacets } from '@/ai/genkit';

/* --sectionComment
SECTION: COMPONENT (ChatTab)
*/
export function ChatTab() {
  /* --sectionComment
  SECTION: CONSTANTS
  */
  const sessionId = 'default-chat-session';
  const LOG_SCOPE = '[ChatTab → AI]';

  /* --sectionComment
  SECTION: STATE
  */
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bootReady, setBootReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Get state and functions from our "Smarter Brain" Context ---
  const {
    currentQuestion,
    finalProducts, // <-- We still listen for this to stop posting questions
    applyExtractedFacets,
  } = useConfiguratorContext();

  // Ref to prevent duplicate question-posting
  const lastPostedQuestionRef = useRef<string | null>(null);

  /* --sectionComment
  SECTION: BOOTSTRAP (Firestore-first)
  */
  useEffect(() => {
    console.group('[ChatTab] mount bootstrap');
    (async () => {
      try {
        console.log('sessionId =', sessionId);
        const loaded = await loadSession(sessionId);
        if (loaded) {
          setSession(loaded);
          setMessages(loaded.messages ?? []);
          console.log(
            `[ChatTab] loaded ${
              loaded.messages?.length ?? 0
            } messages from Firestore/local cache`
          );
        } else {
          const created = createSession();
          created.sessionId = sessionId;
          saveSession(created); // Save legacy local
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

  /* --sectionComment
  SECTION: LOCAL MIRROR (Deprecated)
  */
  useEffect(() => {
    if (!session) return;
    console.groupCollapsed('[ChatTab] messages changed → local mirror');
    try {
      const snapshot: ChatSession = { ...session, messages, updatedAt: Date.now() };
      saveSession(snapshot);
      console.log('saveSession(snapshot), messages.length =', messages.length);
    } catch (e) {
      console.error('[ChatTab] saveSession error:', e);
    } finally {
      console.groupEnd();
    }
  }, [messages, session]);

  /* --sectionComment
  SECTION: Listen to ConfiguratorContext
  */
  useEffect(() => {
    // Do not post any new questions if the flow is finished
    if (!bootReady || !currentQuestion || finalProducts) {
      return;
    }

    const newQuestionText = currentQuestion.question;
    const lastMessage = messages[messages.length - 1];

    // Prevent posting if the last message is already the question
    // or if the last message is a loading bubble (wait for it to resolve)
    if (
      newQuestionText &&
      newQuestionText !== lastPostedQuestionRef.current &&
      newQuestionText !== lastMessage?.text &&
      lastMessage?.variant !== 'loading' // <-- Don't post while loading
    ) {
      console.log(
        `[ChatTab] Context changed. Posting new question: ${newQuestionText}`
      );
      const ts = Date.now();
      const appBubble: ChatMessage = {
        id: String(ts),
        sender: 'assistant',
        text: newQuestionText,
        timestamp: ts,
        variant: 'incoming',
      };

      // --- MODIFICATION ---
      // When posting the app's next question, we also clean up
      // any 'loading' bubble that might still be around (e.g., if no KB answer was given).
      setMessages((prev) => [
        ...prev.filter((m) => m.variant !== 'loading'),
        appBubble,
      ]);
      lastPostedQuestionRef.current = newQuestionText; // Mark as posted

      // Save the app's question to Firestore
      saveMessageToFirestore(sessionId, 'bot', newQuestionText, {
        timestamp: ts,
      });
    }
    // Listen for changes to finalProducts to stop posting questions
  }, [currentQuestion, finalProducts, messages, bootReady, sessionId]);

  /* --sectionComment
  SECTION: SEND HANDLER (Refactored for "Loading Bubble")
  */
  const handleSendMessage = async (text: string) => {
    console.group('[ChatTab] handleSendMessage');
    console.time(`${LOG_SCOPE} total`);
    setIsLoading(true);

    const trimmed = text?.trim();
    if (!trimmed) {
      console.warn(`${LOG_SCOPE} ignored empty message`);
      setIsLoading(false); // <-- Reset loading state
      return;
    }
    if (!bootReady) {
      console.warn(`${LOG_SCOPE} send attempted before bootstrap complete`);
      setIsLoading(false); // <-- Reset loading state
      return;
    }

    const userTs = Date.now();
    const optimistic: ChatMessage = {
      id: String(userTs),
      sender: 'user',
      text: trimmed,
      timestamp: userTs,
      variant: 'outgoing',
    };

    // --- MODIFICATION ---
    // Create the loading bubble that will be added immediately
    const loadingTs = userTs + 1; // Ensure unique ID
    const loadingBubble: ChatMessage = {
      id: String(loadingTs),
      sender: 'assistant',
      text: '...', // Placeholder text, will be replaced by animation
      timestamp: loadingTs,
      variant: 'loading',
    };

    // --- MODIFICATION ---
    // 1) Optimistic UI append (Add user bubble + loading bubble at once)
    setMessages((prev) => [...prev, optimistic, loadingBubble]);

    // --- MODIFICATION ---
    // 2) Firestore mirror (Run in background, DO NOT await)
    saveMessageToFirestore(sessionId, 'user', trimmed, { timestamp: userTs });

    try {
      // 3) AI Request
      console.group(`${LOG_SCOPE} send to /api/chat`);
      console.time(`${LOG_SCOPE} fetch latency`);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: trimmed,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // 4) Receive AI "Form"
      const aiJson: ExtractedFacets = await response.json();
      console.timeEnd(`${LOG_SCOPE} fetch latency`);
      console.log(`${LOG_SCOPE} ← AI response (JSON Form):`, aiJson);

      // 5) Post the KB Answer (if one exists)
      const kbAnswer = aiJson.knowledgeBaseAnswer;
      if (kbAnswer && kbAnswer.trim() !== '' && kbAnswer.trim() !== 'null') {
        console.log(`${LOG_SCOPE} Posting KB answer bubble.`);
        const answerTs = Date.now();
        const answerBubble: ChatMessage = {
          id: String(answerTs),
          sender: 'assistant',
          text: kbAnswer,
          timestamp: answerTs,
          variant: 'incoming',
        };

        // --- MODIFICATION ---
        // Atomically remove the loading bubble and add the answer bubble
        setMessages((prev) => [
          ...prev.filter((m) => m.variant !== 'loading'),
          answerBubble,
        ]);

        // Save the answer bubble to Firestore (run in background)
        saveMessageToFirestore(sessionId, 'bot', kbAnswer, {
          timestamp: answerTs,
        });
      }
      // If no KB answer, the loading bubble will be removed
      // by the useEffect hook when it posts the next question.

      // 6) Apply AI Form to Context (This triggers the configurator logic)
      applyExtractedFacets(aiJson);

      console.log(`${LOG_SCOPE} completed successfully`);
    } catch (err) {
      console.error(`${LOG_SCOPE} ❌ error during send:`, err);
      const fallback: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Error: unable to reach AI backend.',
        timestamp: Date.now(),
        variant: 'incoming',
      };

      // --- MODIFICATION ---
      // Atomically remove the loading bubble and add the error bubble
      setMessages((prev) => [
        ...prev.filter((m) => m.variant !== 'loading'),
        fallback,
      ]);
    } finally {
      setIsLoading(false);
      console.timeEnd(`${LOG_SCOPE} total`);
      console.groupEnd();
      console.groupEnd();
    }
  };

  /* --sectionComment
  SECTION: RENDER
  */
  return (
    <div className="bg-[#0d1a26] flex flex-col h-[80vh] text-white">
      {/* Pass messages state to the bubble area */}
      <ChatBubbleArea messages={messages ?? []} />
      <FooterArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}