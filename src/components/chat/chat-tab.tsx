/*
*file-summary*
PATH: src/components/chat/chat-tab.tsx
PURPOSE: Manages the chat UI, message history, and acts as the "glue"
         between user text input and the ConfiguratorContext.
SUMMARY: This component now manages the "AI is thinking" loading bubble.
         When a user sends a message, it atomically adds both the user's
         message and a 'loading' bubble to the state.
         When the AI responds, it atomically removes the 'loading' bubble
         and replaces it with the AI's answer and/or the next question.
IMPORTS:
 - React: useState, useEffect, useRef
 - Context: useConfiguratorContext
 - Engine/AI types: ExtractedFacets
 - Components: ChatBubbleArea, FooterArea
 - Firestore: chat-storage helpers, saveMessageToFirestore
EXPORTS:
 - ChatTab (named React functional component)
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