/* *file-summary*
PATH: src/components/header/restart-button.tsx

PURPOSE: Provides a standard, styled button for resetting the entire product configuration flow.

SUMMARY: This is a **dumb UI component** that receives a single callback function, `onReset`, via props. It renders a `Button` component (from the global design system) with a "ghost" style, a small size, and the `RefreshCw` icon. When clicked, it executes the `onReset` function, which is provided by the `AppHeader` and connected to the `ConfiguratorContext.reset()` method, effectively clearing the user's selection and restarting the "Smarter Brain."

RELATES TO OTHER FILES:
- It is imported and used by 'src/components/header/app-header.tsx' (for the mobile layout) and 'src/components/header/progress-tracker.tsx' (for the desktop layout).
- It relies on the generic `Button` component from '../global/button'.
- The `onReset` function it triggers is sourced from `useConfiguratorContext().reset()` in the `AppHeader`.

IMPORTS:
- Button from "../global/button"
- RefreshCw from "lucide-react"

EXPORTS:
- ResetButton (React functional component)
*/

import { Button } from "../global/button";
import { RefreshCw } from "lucide-react";

type ResetButtonProps = {
  onReset: () => void;
};

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onReset} className="text-xs sm:text-sm">
      <RefreshCw className="w-3 h-3 mr-1.5" />
      Recomeçar
    </Button>
  );
}
