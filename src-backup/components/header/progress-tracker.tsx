/* *file-summary*
PATH: src/components/header/progress-tracker.tsx

PURPOSE: To create a single, combined UI component for the desktop header that displays both the user's progress and the reset control.

SUMMARY: This is a **dumb layout component** designed specifically for the desktop view. It receives the `history` array and the `onReset` function as props. It doesn't perform any logic itself; it simply passes the `onReset` prop to the `ResetButton` component and the `history` prop to the `Breadcrumb` component, arranging them in a flexible, responsive container.

RELATES TO OTHER FILES:
- It is imported and rendered exclusively by 'src/components/header/app-header.tsx' for its desktop layout.
- It acts as a wrapper, importing and composing its two child components: './restart-button.tsx' and './breadcrumb.tsx'.

IMPORTS:
- ResetButton from './restart-button'
- Breadcrumb from './breadcrumb'

EXPORTS:
- ProgressTracker (React functional component)
*/


import { ResetButton } from './restart-button';
import { Breadcrumb } from './breadcrumb';

type ProgressTrackerProps = {
  history: string[];
  onReset: () => void;
};

export function ProgressTracker({ history, onReset }: ProgressTrackerProps) {
  return (
    <div
      className="flex items-center justify-between flex-wrap gap-2 md:gap-4"
    >
      <ResetButton onReset={onReset} />
      <Breadcrumb history={history} />
    </div>
  );
}
