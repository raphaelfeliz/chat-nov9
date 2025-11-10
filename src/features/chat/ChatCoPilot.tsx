/* *file-summary*
PATH: src/features/chat/ChatCoPilot.tsx

PURPOSE: The "smart" controller for the AI Chat feature (Pillar 2).

SUMMARY: This is the "chat logic folder." It connects to the core logic,
         manages all chat state (loading, message history), and orchestrates
         the "Answer-then-Question" sequence. It consumes the
         ConfiguratorContext, calls the AI API, and orchestrates persistence
         by passing complete message objects (including `variant`)
         to the `chatHistory` service.
         It passively saves contact info, actively prompts for it,
         and handles the "talk to human" handover flow. This file contains
         bug fixes for the handover flow logic.

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
- Core Persistence: loadSession, saveMessage, createSession, ChatMessage, ChatSession,
  saveInitialSession, updateSessionContactInfo
- UI Components: ChatDisplay, ChatInput
- { generateWhatsAppLink } from '@/lib/utils'
- { FACET_ORDER } from '@/core/engine/configuratorEngine'
*/

'use client';

import React, { useEffect, useState, useRef } from 'react';

// --- REFACTOR: Import from new 'core' paths ---
import {
  loadSession,
  saveMessage as saveMessageToFirestore,
  createSession,
  // --- NEW (Phase 2.3.1) ---
  saveInitialSession,
  updateSessionContactInfo,
} from '@/core/persistence/chatHistory';
// --- FIX: Import types from the correct types.ts file ---
import {
  type ChatSession,
  type ChatMessage,
} from '@/core/persistence/types';
import { useConfiguratorContext } from '@/core/state/ConfiguratorContext';
import { type ExtractedFacets } from '@/core/ai/genkit';
// --- NEW (Phase 1.1.1) ---
import { generateWhatsAppLink } from '@/lib/utils';
// --- REFACTOR: Import from new 'ui' paths ---
import { ChatDisplay } from './ui/ChatDisplay';
import { ChatInput } from './ui/ChatInput';
// --- NEW (BUG FIX) ---
// Import FACET_ORDER to iterate selectedOptions for the WA link
import { FACET_ORDER } from '@/core/engine/configuratorEngine';

// --- NEW (Debug Logging) ---
// Set to false for production
const DEBUG = true;

export function ChatCoPilot() {
  // --SECTION: LOGGING & CONSTANTS
  const sessionId = 'default-chat-session';

  // --- NEW (Debug Logging) ---
  // Concise, human-friendly log helpers
  const log = (message: string, ...args: any[]) => {
    if (DEBUG) console.log(`[ChatCoPilot] ${message}`, ...args);
  };
  const logGroup = (message: string) => {
    if (DEBUG) console.group(`[ChatCoPilot] ${message}`);
  };
  const logGroupEnd = () => {
    if (DEBUG) console.groupEnd();
  };

  // --SECTION: STATE
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bootReady, setBootReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Get state and functions from our "Smarter Brain" Context ---
  const {
    selectedOptions, // <-- NEW: Get all selections for WhatsApp link
    currentQuestion,
    finalProducts, // <-- We listen for this to stop posting questions
    applyExtractedFacets,
  } = useConfiguratorContext();

  // --SECTION: REFS
  const lastPostedQuestionRef = useRef<string | null>(null);
  const activePromptFiredRef = useRef(false);
  // --- UPDATED (Phase 3.3.5 Bug Fix) ---
  // Use useRef instead of useState for synchronous state checking
  const isHandoverActive = useRef(false);

  // --SECTION: BOOTSTRAP (Firestore-first)
  useEffect(() => {
    logGroup('mount bootstrap');
    (async () => {
      log('sessionId =', sessionId);
      const loaded = await loadSession(sessionId);
      if (loaded) {
        setSession(loaded);
        setMessages(loaded.messages ?? []);
        log(`loaded ${loaded.messages?.length ?? 0} messages and session data.`);
      } else {
        // --- UPDATED (Phase 2.3.1) ---
        // Create session in memory AND in Firestore
        log('No session found. Creating new one...');
        const created = createSession();
        created.sessionId = sessionId; // Assign the static ID
        await saveInitialSession(created); // Create the parent doc in DB
        setSession(created); // Set to local state
        setMessages([]);
        log('created new session (empty).');
      }
    })()
      .catch((e) => console.error('[ChatCoPilot] bootstrap error:', e))
      .finally(() => {
        setBootReady(true);
        logGroupEnd();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // --SECTION: LISTENERS (EFFECTS)

  /**
   * Listen to ConfiguratorContext (Posts the "Question")
   */
  useEffect(() => {
    // --- UPDATED (Phase 3.3.5 Bug Fix) ---
    // Do not post configurator questions if we are in a human handover
    if (
      !bootReady ||
      !currentQuestion ||
      finalProducts ||
      isHandoverActive.current
    ) {
      log('Question listener skipped (bootReady/currentQ/final/handover)');
      return;
    }
    // --- END OF UPDATE ---

    const newQuestionText = currentQuestion.question;
    const lastMessage = messages[messages.length - 1];

    if (
      newQuestionText &&
      newQuestionText !== lastPostedQuestionRef.current &&
      newQuestionText !== lastMessage?.text &&
      lastMessage?.variant !== 'loading'
    ) {
      log(`Context changed. Posting new question: ${newQuestionText}`);
      const ts = Date.now();
      const appBubble: ChatMessage = {
        id: String(ts),
        sender: 'assistant',
        text: newQuestionText,
        timestamp: ts,
        variant: 'incoming',
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.variant !== 'loading'),
        appBubble,
      ]);
      lastPostedQuestionRef.current = newQuestionText;
      // --- 🛟 BUG FIX: Pass full message object to save ---
      saveMessageToFirestore(sessionId, {
        sender: 'bot',
        text: newQuestionText,
        variant: 'incoming',
      });
    }
  }, [currentQuestion, finalProducts, messages, bootReady, sessionId, log]);

  /**
   * --- NEW (Phase 2.3.1) ---
   * Listen for Final Product to trigger "Active Contact Prompt"
   */
  useEffect(() => {
    // --- UPDATED (Phase 3.3.5 Bug Fix) ---
    if (
      !bootReady ||
      !finalProducts ||
      !session ||
      activePromptFiredRef.current ||
      isHandoverActive.current
    ) {
      return; // Not ready, or no product, or no session, or already fired
    }

    // If we have a product AND we don't know the user's name
    if (finalProducts.length > 0 && !session.userName) {
      log(
        'Active Prompt: Final product found, user name is missing. Asking for name.'
      );
      const promptText =
        'Encontrei seu produto! Para salvar esta cotação, com quem eu falo?';

      // --- 🛟 BUG FIX: Pass full message object to save ---
      saveMessageToFirestore(sessionId, {
        sender: 'bot',
        text: promptText,
        variant: 'incoming',
      });

      const ts = Date.now();
      const appBubble: ChatMessage = {
        id: String(ts),
        sender: 'assistant',
        text: promptText,
        timestamp: ts,
        variant: 'incoming',
      };
      setMessages((prev) => [...prev, appBubble]);

      activePromptFiredRef.current = true; // Mark as fired
      lastPostedQuestionRef.current = promptText;
    }
  }, [finalProducts, session, bootReady, log]); // Added isHandoverActive.current

  // --SECTION: SEND HANDLER
  const handleSendMessage = async (text: string) => {
    logGroup('handleSendMessage');
    const startTime = Date.now();
    setIsLoading(true);

    const trimmed = text?.trim();
    if (!bootReady || !session) {
      log('ignored empty message or boot not ready');
      setIsLoading(false);
      logGroupEnd();
      return;
    }

    log(`User sent: "${trimmed}"`);
    const lastAppMessage = messages[messages.length - 1]; // Get this *before* adding new bubbles

    const userTs = Date.now();
    const optimistic: ChatMessage = {
      id: String(userTs),
      sender: 'user',
      text: trimmed,
      timestamp: userTs,
      variant: 'outgoing',
    };

    const loadingTs = userTs + 1;
    const loadingBubble: ChatMessage = {
      id: String(loadingTs),
      sender: 'assistant',
      text: '...',
      timestamp: loadingTs,
      variant: 'loading',
    };

    // 1) Optimistic UI append
    log('Displaying optimistic user message and loading bubble.');
    setMessages((prev) => [...prev, optimistic, loadingBubble]);

    // 2) Firestore mirror (Run in background)
    // --- 🛟 BUG FIX: Pass full message object to save ---
    saveMessageToFirestore(sessionId, {
      sender: 'user',
      text: trimmed,
      variant: 'outgoing',
    });

    try {
      // 3) AI Request
      logGroup('AI Request');
      log('Sending to /api/chat...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: trimmed }),
      });
      log(`Fetch latency: ${Date.now() - startTime}ms`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // 4) Receive AI "Form"
      const aiJson: ExtractedFacets = await response.json();
      log('← AI response received.');
      if (DEBUG) console.log('JSON Form:', aiJson); // Use console.log for object
      logGroupEnd();

      const ts = Date.now();
      const bubblesToPost: ChatMessage[] = [];
      let didFollowUp = false; // Prevents configurator from running
      let localSession = { ...session }; // Create a mutable copy of session

      // --- UPDATED (Bug Fix) ---
      // 5) Passive Contact Save (RUNS FIRST)
      const contactData: {
        userName?: string;
        userEmail?: string;
        userPhone?: string;
      } = {};
      if (aiJson.userName && aiJson.userName !== 'null')
        contactData.userName = aiJson.userName;
      if (aiJson.userEmail && aiJson.userEmail !== 'null')
        contactData.userEmail = aiJson.userEmail;
      if (aiJson.userPhone && aiJson.userPhone !== 'null')
        contactData.userPhone = aiJson.userPhone;

      const hasNewContactInfo = Object.keys(contactData).length > 0;

      if (hasNewContactInfo) {
        log('Passively saving contact info:', contactData);
        await updateSessionContactInfo(sessionId, contactData);
        // Update local session immediately
        localSession = { ...localSession, ...contactData };
        setSession(localSession); // Update React state
      }

      // 6) Acknowledgment Rule
      if (hasNewContactInfo) {
        const currentName =
          contactData.userName ||
          (localSession.userName && localSession.userName !== 'null'
            ? localSession.userName
            : null);
        const ackText = currentName
          ? `Grato, ${currentName}!`
          : 'Grato, recebi seus dados!';
        log(`Adding Acknowledgment bubble: "${ackText}"`);
        bubblesToPost.push({
          id: `ack-${ts}`,
          sender: 'assistant',
          text: ackText,
          timestamp: ts,
          variant: 'incoming',
        });
      }

      // --- UPDATED (Bug Fix) ---
      // 7) Deterministic Handover (RUNS AFTER CONTACT SAVE)
      if (aiJson.talkToHuman) {
        log('AI detected "talkToHuman" intent.');
        didFollowUp = true; // Stop configurator
        isHandoverActive.current = true; // Set the gate

        // Check if we *already* have contact info (from this or previous messages)
        if (localSession.userPhone || localSession.userEmail) {
          log('User has info, posting WA link directly.');
          const whatsAppLink = generateWhatsAppLink({
            userName: localSession.userName,
            facets: FACET_ORDER.map((f) => selectedOptions[f]).filter(
              Boolean
            ) as string[],
          });
          bubblesToPost.push({
            id: `wa-link-${ts + 1}`,
            sender: 'assistant',
            text: whatsAppLink,
            timestamp: ts + 1,
            variant: 'whatsapp-link',
          });
          isHandoverActive.current = false; // Handover is complete
        } else {
          // We need info, so ask the question
          log('User has no info. Posting handover question.');
          const handoverText =
            'Claro, posso te passar para o especialista. Qual seu whatsapp? Ou prefere por email?';
          bubblesToPost.push({
            id: `handover-${ts + 1}`,
            sender: 'assistant',
            text: handoverText,
            timestamp: ts + 1,
            variant: 'incoming',
          });
        }
      }
      // --- BUG FIX (Logic Failure) ---
      // This logic now runs *regardless* of what's in 'knowledgeBaseAnswer'.
      // If the handover is active, we *only* care about contact info
      // to post the WA link.
      else if (isHandoverActive.current) {
        didFollowUp = true; // This is a "follow up"

        if (hasNewContactInfo) {
          log('Handover complete (reply). Posting WA Link.');
          isHandoverActive.current = false; // End the handover mode
          activePromptFiredRef.current = true; // Prevent "com quem eu falo" from firing

          const whatsAppLink = generateWhatsAppLink({
            userName: localSession.userName,
            facets: FACET_ORDER.map((f) => selectedOptions[f]).filter(
              Boolean
            ) as string[],
          });

          bubblesToPost.push({
            id: `wa-link-${ts + 1}`,
            sender: 'assistant',
            text: whatsAppLink,
            timestamp: ts + 1,
            variant: 'whatsapp-link',
          });
        } else {
          log('Handover replied with no contact info.');
          bubblesToPost.push({
            id: `handover-fail-${ts + 1}`,
            sender: 'assistant',
            text: 'Entendido. Se mudar de ideia, é só pedir para falar com um especialista.',
            timestamp: ts + 1,
            variant: 'incoming',
          });
          isHandoverActive.current = false; // End the handover mode anyway
        }
      }

      // 9) Standard Configurator Follow-ups
      else if (
        !isHandoverActive.current &&
        lastAppMessage &&
        !aiJson.knowledgeBaseAnswer
      ) {
        if (
          lastAppMessage.text.includes('com quem eu falo?') &&
          aiJson.userName &&
          aiJson.userName !== 'null'
        ) {
          bubblesToPost.push({
            id: `followup-${ts + 1}`,
            sender: 'assistant',
            text: 'Obrigado! Qual o seu melhor email?',
            timestamp: ts + 1,
            variant: 'incoming',
          });
          didFollowUp = true;
        } else if (
          lastAppMessage.text.includes('qual o seu melhor email?') &&
          aiJson.userEmail &&
          aiJson.userEmail !== 'null'
        ) {
          bubblesToPost.push({
            id: `followup-${ts + 1}`,
            sender: 'assistant',
            text: 'Perfeito. E para finalizar, qual seu WhatsApp/telefone?',
            timestamp: ts + 1,
            variant: 'incoming',
          });
          didFollowUp = true;
        } else if (
          lastAppMessage.text.includes('qual seu WhatsApp/telefone?') &&
          aiJson.userPhone &&
          aiJson.userPhone !== 'null'
        ) {
          bubblesToPost.push({
            id: `followup-${ts + 1}`,
            sender: 'assistant',
            text: 'Tudo certo! Recebi seus dados. 👍',
            timestamp: ts + 1,
            variant: 'incoming',
          });
          didFollowUp = true;
        }
      }

      // 10) KB Answer (if no other main reply was set)
      const kbAnswer = aiJson.knowledgeBaseAnswer;
      if (
        !didFollowUp &&
        !isHandoverActive.current &&
        kbAnswer &&
        kbAnswer.trim() !== '' &&
        kbAnswer.trim() !== 'null'
      ) {
        log(`Adding KB answer bubble: "${kbAnswer}"`);
        bubblesToPost.push({
          id: `kb-${ts + 1}`,
          sender: 'assistant',
          text: kbAnswer,
          timestamp: ts + 1,
          variant: 'incoming',
        });
      }

      // 11) Post Bubbles & Fix Hanging Loader
      if (bubblesToPost.length > 0) {
        log(`Posting ${bubblesToPost.length} bot replies...`);
        setMessages((prev) => [
          ...prev.filter((m) => m.variant !== 'loading'),
          ...bubblesToPost,
        ]);
        // --- 🛟 BUG FIX: Pass full message object to save ---
        // Save all new bubbles to Firestore
        for (const bubble of bubblesToPost) {
          saveMessageToFirestore(sessionId, {
            sender: bubble.sender,
            text: bubble.text,
            variant: bubble.variant,
          });
        }
        lastPostedQuestionRef.current =
          bubblesToPost[bubblesToPost.length - 1].text;
      } else {
        log('No bot replies. Removing loading bubble.');
        setMessages((prev) => prev.filter((m) => m.variant !== 'loading'));
      }

      // 12) Apply AI Form to Context
      if (!didFollowUp && !isHandoverActive.current) {
        log('Applying facets to ConfiguratorContext.');
        applyExtractedFacets(aiJson);
      } else {
        log('Skipping facet apply due to follow-up or handover.');
      }

      log('handleSendMessage completed successfully');
    } catch (err: any) {
      log('❌ error during send:', err);
      const fallback: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Error: unable to reach AI backend.',
        timestamp: Date.now(),
        variant: 'incoming',
      };
      setMessages((prev) => [
        ...prev.filter((m) => m.variant !== 'loading'),
        fallback,
      ]);
    } finally {
      setIsLoading(false);
      log(`total: ${Date.now() - startTime}ms`);
      logGroupEnd();
      logGroupEnd();
    }
  };

  // --SECTION: RENDER
  return (
    <div className="bg-[#0d1a26] flex flex-col h-[92vh] text-white">
      <ChatDisplay messages={messages ?? []} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}