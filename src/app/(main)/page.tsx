/* *file-summary*
PATH: src/app/page.tsx

PURPOSE: Defines the main page layout, handling the responsive display
         of the Configurator and Chat components.

SUMMARY: This component implements the application's primary responsive UI.
         - On mobile, it uses a state variable ('activeTab') to render
           tab buttons and toggle between <Configurator /> and <ChatCoPilot />.
         - On desktop, it switches to a 2-column layout, displaying the
           main <Configurator /> component and a sticky <ChatCoPilot /> sidebar.

RELATES TO OTHER FILES:
- This is the main page component rendered inside `src/app/layout.tsx`.
- It imports and arranges the two core feature pillars:
  - `Configurator` from `src/features/configurator/Configurator.tsx`.
  - `ChatCoPilot` from `src/features/chat/ChatCoPilot.tsx`.

IMPORTS:
- useState from 'react'
- ChatCoPilot from '@/features/chat/ChatCoPilot'
- Configurator from '@/features/configurator/Configurator'
*/

'use client';

import { useState } from 'react';
// --- REFACTOR: Import from new 'features' paths ---
import { ChatCoPilot } from '@/features/chat/ChatCoPilot';
import Configurator from '@/features/configurator/Configurator';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'configurator' | 'chat'>(
    'configurator'
  );

  return (
    <main className="flex-1 flex flex-col">
      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-b">
        <nav className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('configurator')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'configurator'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Monte Agora
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'chat'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Chat Online
          </button>
        </nav>
      </div>

      <div className="flex flex-1">
        {/* Mobile View */}
        <div className="md:hidden w-full">
          {/* --- REFACTOR: Simplified to use main components directly --- */}
          {activeTab === 'configurator' && <Configurator />}
          {activeTab === 'chat' && <ChatCoPilot />}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-1">
          <div className="flex-1 p-4">
            <Configurator />
          </div>
          <div className="w-[400px] border-l">
            <div className="sticky top-0">
              <ChatCoPilot />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}