'use client';

import { useState } from 'react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatTab } from '@/components/chat/chat-tab';
import { Configurator } from '@/components/configurator/configurator';
import { ConfiguratorTab } from '@/components/configurator/configurator-tab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('configurator');

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
            Configurador
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'chat'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Chat
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
          <div className="w-[400px] border-l p-4">
            <ChatPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
