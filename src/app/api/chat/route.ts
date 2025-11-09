/* *file-summary*
PATH: src/app/api/chat/route.ts

PURPOSE: The server-side API endpoint for the chat feature.

SUMMARY: This file defines the POST request handler for `/api/chat`.
         It receives the `userInput` from the client (`ChatCoPilot.tsx`),
         calls the `extractAttributesFromText` function from the Genkit
         engine, and returns the resulting JSON "form" to the client.

RELATES TO OTHER FILES:
- This is the "API mailman."
- It imports and calls the `extractAttributesFromText` function
  from `src/core/ai/genkit.ts`.
- It is called via `fetch` by `src/features/chat/ChatCoPilot.tsx`.

IMPORTS:
- NextResponse from 'next/server'
- extractAttributesFromText from '@/core/ai/genkit'
*/

import { NextResponse } from 'next/server';
// --- REFACTOR: Import from new 'core' path ---
import { extractAttributesFromText } from '@/core/ai/genkit';

// Force Node.js runtime for Genkit/Gemini
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: 'Missing userInput' },
        { status: 400 }
      );
    }

    // Call the "Dual-Task AI" logic
    const aiJson = await extractAttributesFromText(userInput);

    // Return the complete JSON "form" to the client
    return NextResponse.json(aiJson);
  } catch (err: any) {
    console.error('[API Route] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}