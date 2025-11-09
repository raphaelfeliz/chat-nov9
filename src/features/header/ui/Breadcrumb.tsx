/* *file-summary*
PATH: src/features/header/ui/Breadcrumb.tsx

PURPOSE: A "dumb" visual component that renders a breadcrumb trail.

SUMMARY: This component receives a `history` array of strings via props.
         It maps over the array, separating items with a ChevronRight
         icon and highlighting the last item as the current step.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/header/AppHeader.tsx`.

IMPORTS:
- lucide-react (ChevronRight icon)
*/

'use client';

import { ChevronRight } from 'lucide-react';

type BreadcrumbProps = {
  history: string[];
};

export function Breadcrumb({ history }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
      {history.length > 0 &&
        history.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            <span
              className={
                index === history.length - 1
                  ? 'font-medium text-foreground'
                  : ''
              }
            >
              {item}
            </span>
          </div>
        ))}
    </div>
  );
}