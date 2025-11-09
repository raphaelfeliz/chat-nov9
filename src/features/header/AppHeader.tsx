/* *file-summary*
PATH: src/features/header/AppHeader.tsx

PURPOSE: The "smart" controller for the application's persistent header bar.

SUMMARY: This component consumes the ConfiguratorContext to get the
         `fullProductName` string (for the breadcrumbs) and the `reset`
         function (for the reset button). It then passes this data down
         as props to its "dumb" visual children.

RELATES TO OTHER FILES:
- This is the "smart" parent for this feature.
- It is imported by `src/app/layout.tsx`.
- It consumes state from `src/core/state/ConfiguratorContext.tsx`.
- It imports its "dumb" children from `./ui/Breadcrumb.tsx` and `./ui/ResetButton.tsx`.

IMPORTS:
- Image from 'next/image'
- useConfiguratorContext from '@/core/state/ConfiguratorContext'
- ResetButton from './ui/ResetButton'
- Breadcrumb from './ui/Breadcrumb'
*/

'use client';

import Image from 'next/image';
// --- REFACTOR: Import from new 'core' path ---
import { useConfiguratorContext } from '@/core/state/ConfiguratorContext';
// --- REFACTOR: Import from new 'ui' paths ---
import { ResetButton } from './ui/ResetButton';
import { Breadcrumb } from './ui/Breadcrumb';

export function AppHeader() {
  // 1. Get state and triggers from the global context
  const { fullProductName, reset } = useConfiguratorContext();

  // 2. Create the 'history' array by splitting the product name string.
  const historyArray = fullProductName.split(' ').filter(Boolean);

  return (
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

          {/* --- REFACTOR: Logic from old 'ProgressTracker' is now inlined --- */}
          <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
            <ResetButton onReset={reset} />
            <Breadcrumb history={historyArray} />
          </div>
          {/* --- END REFACTOR --- */}
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
            <Breadcrumb history={historyArray} />
          </div>
        </div>
      </div>
    </header>
  );
}