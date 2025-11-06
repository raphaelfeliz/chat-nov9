'use client';

import Image from 'next/image';
import { useConfiguratorContext } from '@/context/ConfiguratorContext';
import { ProgressTracker } from './progress-tracker';
import { ResetButton } from './restart-button';
import { Breadcrumb } from './breadcrumb';

export function AppHeader() {
  const { history, reset } = useConfiguratorContext();

  return (
    // To adjust the header height, modify the classes below.
    // - `h-[16vh]`: Controls the height on mobile devices.
    // - `md:h-[8vh]`: Controls the height on desktop screens.
    <header className="bg-background/80 backdrop-blur-sm z-40 w-full border-b h-[16vh] md:h-[8vh]">
      <div className="container mx-auto px-4 h-full flex items-center">
        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:flex w-full items-center justify-between h-full">
          <div className="relative w-32 h-full">
            <Image
              src="/assets/images/logo FDA.png"
              alt="Fábrica do Alumínio Logo"
              fill
              className="object-contain p-2.5"
            />
          </div>
          <ProgressTracker history={history} onReset={reset} />
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden flex flex-col w-full h-full">
          {/* Top Row */}
          <div className="flex items-center w-full h-1/2">
            {/* Left */}
            <div className="w-1/2 relative h-full">
              <Image
                src="/assets/images/logo FDA.png"
                alt="Fábrica do Alumínio Logo"
                fill
                className="object-contain object-left p-2.5"
              />
            </div>
            {/* Right */}
            <div className="w-1/2 flex justify-end">
              <ResetButton onReset={reset} />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="w-full h-1/2 flex items-center">
            <Breadcrumb history={history} />
          </div>
        </div>
      </div>
    </header>
  );
}
