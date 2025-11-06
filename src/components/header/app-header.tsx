'use client';

import Image from 'next/image';
import { NavLink } from './nav-link';
import { ProgressTracker } from './progress-tracker'
import { useConfiguratorContext } from '@/context/ConfiguratorContext';

export function AppHeader() {
  const { history, reset } = useConfiguratorContext();
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      {/*
        This container handles the responsive layout.
        - Mobile: Default block layout, creating a two-row appearance.
        - Desktop (md and up): Flexbox row, creating a single-row layout.
      */}
      <div className="container mx-auto px-4 md:flex md:h-16 md:items-center md:justify-between">
        {/*
          Top row on mobile, containing logo and mobile navigation.
          Becomes the left-most item on desktop.
        */}
        <div className="flex h-16 items-center justify-between md:h-auto">
          <div className="flex items-center gap-2">
            <Image src="/assets/images/logo FDA.png" alt="FDA Logo" width={32} height={32} />
          </div>
          {/* Mobile-only navigation */}
          <nav className="flex items-center gap-4 md:hidden">
            <NavLink href="/">Configurador</NavLink>
            <NavLink href="/chat">Chat</NavLink>
          </nav>
        </div>

        {/*
          Second row on mobile, containing the progress tracker.
          Becomes the center item on desktop.
        */}
        <div className="pb-4 md:pb-0">
          <ProgressTracker history={history} onReset={reset} />
        </div>
      </div>
    </header>
  );
}
