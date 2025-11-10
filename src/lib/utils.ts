/* *file-summary*
PATH: src/lib/utils.ts
PURPOSE: Provides common, low-level utility functions for styling and business logic.
SUMMARY: This file exports the `cn()` function for merging Tailwind
         classes and the `generateWhatsAppLink()` function for creating
         context-aware WhatsApp message URLs.
RELATES TO OTHER FILES:
- `cn` is imported by all UI primitives in `src/components/ui/`.
- `generateWhatsAppLink` is imported by `ResultCard.tsx` and `ChatCoPilot.tsx`.
IMPORTS:
- type ClassValue, clsx from 'clsx'
- twMerge from 'tailwind-merge'
EXPORTS:
- cn (function)
- generateWhatsAppLink (function)
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// --SECTION: STYLING UTILITY (Existing Code)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --SECTION: WHATSAPP LINK GENERATOR (New Feature)

// Defines the data the link function can use
type WhatsAppContext = {
  userName?: string | null;
  productName?: string | null;
  facets?: string[] | null; // e.g., ['Janela', 'Correr', 'Vidro']
};

/**
 * Creates a context-aware WhatsApp link.
 * @param context An object containing user and product info.
 * @returns A URL-encoded string for a WhatsApp link.
 */
export const generateWhatsAppLink = (context: WhatsAppContext = {}): string => {
  const phoneNumber = "5511976810216"; // Your target phone number
  let message = "Olá,";

  // 1. Add user's name if we have it
  if (context.userName) {
    message += ` meu nome é ${context.userName},`;
  }

  message += " gostaria de informações sobre esquadrias.";

  // 2. Add product/facet context
  let interest = "";
  if (context.productName) {
    // Priority 1: Use the full product name if available
    interest = context.productName;
  } else if (context.facets && context.facets.length > 0) {
    // Priority 2: Use the partial facets
    interest = context.facets.join(', ');
  }

  if (interest) {
    message += ` Tenho interesse em: ${interest}.`;
  }

  // 3. Encode and create the final URL
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
};