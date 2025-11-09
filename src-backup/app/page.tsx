/* *file-summary*
PATH: src/app/page.tsx

PURPOSE: Defines the main page layout, handling the responsive display of the Configurator and Chat components.

SUMMARY: This component implements the application's primary responsive UI.
- On mobile, it uses a state variable ('activeTab') to render tab buttons and toggle between showing <ConfiguratorTab /> or <ChatTab />.
- On desktop (md: breakpoint), it switches to a 2-column layout, displaying the main <Configurator /> component and a sticky <ChatTab /> sidebar.
- It is a client component ('use client') to manage the tab state.

RELATES TO OTHER FILES:
- This is the main page component rendered inside 'src/app/layout.tsx'.
- It imports and arranges the two core pillars of the application:
- '@/components/configurator/configurator' (and its mobile wrapper 'configurator-tab') as the main interactive area.
- '@/components/chat/chat-tab' as the chat interface (either as a tab or a sidebar).

IMPORTS:
- useState from 'react'
- ChatTab from '@/components/chat/chat-tab'
- Configurator from '@/components/configurator/configurator'
- ConfiguratorTab from '@/components/configurator/configurator-tab'
*/

'use client';

import { useState } from 'react';
// --- FINAL FIX: Removed explicit '.tsx' extensions ---
import { ChatTab } from '@/components/chat/chat-tab';
import Configurator from '@/components/configurator/configurator';
import { ConfiguratorTab } from '@/components/configurator/configurator-tab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'configurator' | 'chat'>('configurator');

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
          {activeTab === 'configurator' && <ConfiguratorTab />}
          {activeTab === 'chat' && <ChatTab />}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-1">
          <div className="flex-1 p-4">
            <Configurator />
          </div>
          <div className="w-[400px] border-l">
            <div className="sticky top-0">
              <ChatTab />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}