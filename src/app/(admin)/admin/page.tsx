// src/app/(admin)/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
// --- ADDING IMPORTS BACK (2 of 2) ---
import { type ChatSession, type ChatMessage } from '@/core/persistence/types';
import {
  loadAllSessionSummaries,
  loadSession,
} from '@/core/persistence/chatHistory';
import { ChatDisplay } from '@/features/chat/ui/ChatDisplay';

export default function AdminPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  // --- ADDING STATE BACK ---
  const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  // --- ADDING STATE BACK ---
  const [isChatLoading, setIsChatLoading] = useState(false);

  // On mount, load the list of all session summaries
  useEffect(() => {
    loadAllSessionSummaries()
      .then(setSessions)
      .finally(() => setIsLoading(false));
  }, []);

  // --- ADDING FULL LOGIC BACK ---
  // When a session is clicked, load its full message history
  const handleSessionClick = async (sessionId: string) => {
    if (sessionId === selectedSessionId) return; // Don't reload if clicking the same one

    setSelectedSessionId(sessionId);
    setIsChatLoading(true); // Show loading state for the chat panel
    setSelectedMessages([]); // Clear previous messages

    const fullSession = await loadSession(sessionId);
    if (fullSession) {
      setSelectedMessages(fullSession.messages);
    }
    setIsChatLoading(false); // Hide chat loading state
  };

  if (isLoading) {
    return (
      <div className="text-white p-8 flex h-screen items-center justify-center">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="flex h-screen text-white">
      {/* Left Column: Session List */}
      <aside className="w-1/3 h-full overflow-y-auto bg-[#0d1a26] border-r border-gray-700">
        <h1 className="text-lg font-bold p-4 sticky top-0 bg-[#0d1a26] z-10 border-b border-gray-700">
          Chat Sessions ({sessions.length})
        </h1>
        <nav>
          <ul>
            {sessions.map((session) => (
              <li key={session.sessionId}>
                <button
                  onClick={() => handleSessionClick(session.sessionId)}
                  className={`w-full text-left p-4 border-b border-gray-700 transition-colors ${
                    selectedSessionId === session.sessionId
                      ? 'bg-[#14293D]'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <p className="font-semibold">
                    {session.userName || 'Visitante'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {session.userEmail || session.sessionId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(session.updatedAt).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Right Column: Chat Viewer (Fully Restored) */}
      <main className="w-2/3 h-full flex flex-col bg-[#0d1a26]">
        {isChatLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Loading conversation...</p>
          </div>
        ) : selectedSessionId ? (
          <div className="flex-1 flex flex-col h-full">
            {/* --- RE-ACTIVATING THE COMPONENT --- */}
            <ChatDisplay messages={selectedMessages} />
            {/* No ChatInput, so it's read-only */}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a session to view the chat.</p>
          </div>
        )}
      </main>
    </div>
  );
}