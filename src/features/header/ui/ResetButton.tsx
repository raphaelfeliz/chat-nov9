/* *file-summary*
PATH: src/features/header/ui/ResetButton.tsx

PURPOSE: A "dumb" visual component for the "Reset" button.

SUMMARY: This component receives an `onReset` function via props.
         It renders the global `Button` primitive with a "ghost"
         style and an icon. When clicked, it executes the `onReset` prop.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/header/AppHeader.tsx`.
- It imports the `Button` primitive from `src/components/ui/button.tsx`.

IMPORTS:
- { Button } from '@/components/ui/button'
- lucide-react (RefreshCw icon)
*/

'use client';

// --- REFACTOR: Import from new 'components/ui' path ---
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type ResetButtonProps = {
  onReset: () => void;
};

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReset}
      className="text-xs sm:text-sm"
    >
      <RefreshCw className="w-3 h-3 mr-1.5" />
      Recomeçar
    </Button>
  );
}