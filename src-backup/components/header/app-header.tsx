/* *file-summary*
PATH: src/components/header/app-header.tsx

PURPOSE: Renders the main, persistent application header, displaying the logo and user's configuration progress.

SUMMARY: This component builds the responsive header (desktop and mobile layouts) that is shown on all pages. Its primary job is to connect to the 'ConfiguratorContext' to get the current 'fullProductName' string. It processes this string into an array ('historyArray') and passes it down to its child components ('ProgressTracker' and 'Breadcrumb') to render the breadcrumb trail. It also retrieves the 'reset' function from the context to wire up the reset buttons.

RELATES TO OTHER FILES:
- This component is imported and rendered by 'src/app/layout.tsx', placing it at the top of every page.
- It is a "smart" component that consumes state directly from 'src/context/ConfiguratorContext.tsx' using the 'useConfiguratorContext' hook.
- It imports and passes props to its "dumb" child components: './progress-tracker.tsx', './restart-button.tsx', and './breadcrumb.tsx'.

IMPORTS:
- Image from 'next/image'
- useConfiguratorContext from '@/context/ConfiguratorContext'
- ProgressTracker from './progress-tracker'
- ResetButton from './restart-button'
- Breadcrumb from './breadcrumb'
*/

'use client';

import Image from 'next/image';
import { useConfiguratorContext } from '@/context/ConfiguratorContext';
import { ProgressTracker } from './progress-tracker';
import { ResetButton } from './restart-button';
import { Breadcrumb } from './breadcrumb';

export function AppHeader() {
  // --- FIX ---
  // 1. Destructure 'fullProductName' (a string) instead of the old 'history' array.
  const { fullProductName, reset } = useConfiguratorContext();

  // 2. Create the 'history' array by splitting the product name string.
  //    'filter(Boolean)' removes any empty strings if 'fullProductName' is empty.
  const historyArray = fullProductName.split(' ').filter(Boolean);
  // --- END FIX ---

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
          {/* 3. Pass the new 'historyArray' to the component */}
          <ProgressTracker history={historyArray} onReset={reset} />
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
            {/* 4. Pass the new 'historyArray' to the component */}
            <Breadcrumb history={historyArray} />
          </div>
        </div>
      </div>
    </header>
  );
}