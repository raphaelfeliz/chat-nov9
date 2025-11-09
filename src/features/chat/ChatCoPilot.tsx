/* *file-summary*
PATH: src/features/chat/ChatCoPilot.tsx

PURPOSE: The "smart" controller for the AI Chat feature (Pillar 2).

SUMMARY: This is the "chat logic folder." It connects to the core logic,
         manages all chat state (loading, message history), and orchestrates
         the "Answer-then-Question" sequence. It consumes the
         ConfiguratorContext, calls the AI API, and saves to persistence.
         It passes all state down to its "dumb" UI children.

RELATES TO OTHER FILES:
- It is the "smart" parent for this feature.
- It is imported by `src/app/page.tsx`.
- Consumes `useConfiguratorContext` from `src/core/state/ConfiguratorContext.tsx`.
- Imports persistence functions from `src/core/persistence/chatHistory.ts`.
- Imports types from `src/core/persistence/types.ts` and `src/core/ai/genkit.ts`.
- Renders its "dumb" children: `./ui/ChatDisplay.tsx` and `./ui/ChatInput.tsx`.

IMPORTS:
- React hooks
- Core Context: useConfiguratorContext
- Core AI types: ExtractedFacets
- Core Persistence: loadSession, saveMessage, createSession, ChatMessage, ChatSession
- UI Components: ChatDisplay, ChatInput
*/

'use client';

import React, { useEffect, useState, useRef } from 'react';

// --- REFACTOR: Import from new 'core' paths ---
import {
  loadSession,
  saveMessage as saveMessageToFirestore,
  createSession,
} from '@/core/persistence/chatHistory';
// --- FIX: Import types from the correct types.ts file ---
import {
  type ChatSession,
  type ChatMessage,
} from '@/core/persistence/types';
import { useConfiguratorContext } from '@/core/state/ConfiguratorContext';
import { type ExtractedFacets } from '@/core/ai/genkit';

// --- REFACTOR: Import from new 'ui' paths ---
import { ChatDisplay } from './ui/ChatDisplay';
import { ChatInput } from './ui/ChatInput';

export function ChatCoPilot() {
  /* --sectionComment
  SECTION: CONSTANTS
  */
  const sessionId = 'default-chat-session';
  const LOG_SCOPE = '[ChatCoPilot → AI]';

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
    finalProducts, // <-- We listen for this to stop posting questions
    applyExtractedFacets,
  } = useConfiguratorContext();

  // Ref to prevent duplicate question-posting
  const lastPostedQuestionRef = useRef<string | null>(null);

  /* --sectionComment
  SECTION: BOOTSTRAP (Firestore-first)
  */
  useEffect(() => {
    console.group('[ChatCoPilot] mount bootstrap');
    (async () => {
      try {
        console.log('sessionId =', sessionId);
        const loaded = await loadSession(sessionId);
        if (loaded) {
          setSession(loaded);
          setMessages(loaded.messages ?? []);
          console.log(
            `[ChatCoPilot] loaded ${
              loaded.messages?.length ?? 0
            } messages from Firestore/local cache`
          );
        } else {
          const created = createSession();
          created.sessionId = sessionId;
          setSession(created);
          setMessages([]);
          console.log('[ChatCoPilot] created new session (empty)');
        }
      } catch (e) {
        console.error('[ChatCoPilot] bootstrap error:', e);
      } finally {
        setBootReady(true);
        console.groupEnd();
      }
    })();
  }, []);

  /* --sectionComment
  SECTION: Listen to ConfiguratorContext (Posts the "Question")
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
        `[ChatCoPilot] Context changed. Posting new question: ${newQuestionText}`
      );
      const ts = Date.now();
      const appBubble: ChatMessage = {
        id: String(ts),
        sender: 'assistant',
        text: newQuestionText,
        timestamp: ts,
        variant: 'incoming',
      };

      // When posting the app's next question, we also clean up
      // any 'loading' bubble that might still be around.
      setMessages((prev) => [
        ...prev.filter((m) => m.variant !== 'loading'),
        appBubble,
      ]);
      lastPostedQuestionRef.current = newQuestionText; // Mark as posted

      // Save the app's question to Firestore
      saveMessageToFirestore(sessionId, 'bot', newQuestionText);
    }
    // Listen for changes to finalProducts to stop posting questions
  }, [currentQuestion, finalProducts, messages, bootReady, sessionId]);

  /* --sectionComment
  SECTION: SEND HANDLER (Orchestrates the "Answer-then-Question" flow)
  */
  const handleSendMessage = async (text: string) => {
    console.group('[ChatCoPilot] handleSendMessage');
    console.time(`${LOG_SCOPE} total`);
    setIsLoading(true);

    const trimmed = text?.trim();
    if (!trimmed || !bootReady) {
      console.warn(`${LOG_SCOPE} ignored empty message or boot not ready`);
      setIsLoading(false);
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

    const loadingTs = userTs + 1; // Ensure unique ID
    const loadingBubble: ChatMessage = {
      id: String(loadingTs),
      sender: 'assistant',
      text: '...', // Placeholder for loader
      timestamp: loadingTs,
      variant: 'loading',
    };

    // 1) Optimistic UI append (Add user bubble + loading bubble)
    setMessages((prev) => [...prev, optimistic, loadingBubble]);

    // 2) Firestore mirror (Run in background)
    saveMessageToFirestore(sessionId, 'user', trimmed);

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

        // Atomically remove loading, add answer
        setMessages((prev) => [
          ...prev.filter((m) => m.variant !== 'loading'),
          answerBubble,
        ]);

        // Save the answer bubble to Firestore
        saveMessageToFirestore(sessionId, 'bot', kbAnswer);
      }

      // 6) Apply AI Form to Context (This triggers the "Question" part)
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

      // Atomically remove loading, add error
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
  SECTION: RENDER (Using "Dumb" UI Components)
  */
  return (
    <div className="bg-[#0d1a26] flex flex-col h-[80vh] text-white">
      {/* Pass messages state to the "dumb" display component */}
      <ChatDisplay messages={messages ?? []} />

      {/* Pass send handler and loading state to "dumb" input component */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}