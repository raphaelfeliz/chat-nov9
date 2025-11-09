/* *file-summary*
PATH: src/lib/utils.ts

PURPOSE: Provides common, low-level utility functions, primarily for styling.

SUMMARY: This file's main export is the `cn()` function. This helper
         utility (from `tailwind-merge` and `clsx`) intelligently
         merges multiple Tailwind CSS class strings, resolving
         conflicts and making conditional styling much cleaner.

RELATES TO OTHER FILES:
- This is a foundational utility.
- It is imported by all UI primitives in `src/components/ui/`
  (e.g., button.tsx, card.tsx, toast.tsx).

IMPORTS:
- type ClassValue, clsx from 'clsx'
- twMerge from 'tailwind-merge'
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}