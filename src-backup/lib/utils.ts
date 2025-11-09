/*
*file-summary*
PATH: src/lib/utils.ts
PURPOSE: Provide a helper to safely compose and merge Tailwind CSS class names.
SUMMARY: Combines clsx for conditional class concatenation with tailwind-merge for resolving conflicting styles,
         producing clean, deduplicated class strings for React components.
IMPORTS: clsx (conditional class utility), tailwind-merge (Tailwind-specific class resolver)
EXPORTS: cn (utility function)
*/

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
