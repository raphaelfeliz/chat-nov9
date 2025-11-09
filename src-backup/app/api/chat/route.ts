/*
*file-summary*
PATH: src/app/api/chat/route.ts
PURPOSE: Handle chat POST requests and return the AI's structured JSON "form".
SUMMARY: Acts as a simple "mailman." It receives the user's text, calls the
         `extractAttributesFromText` function, and returns the complete
         `ExtractedFacets` JSON object to the client for processing.
IMPORTS:
 - Next.js: NextRequest, NextResponse
 - Genkit flow: extractAttributesFromText, ExtractedFacets (from @/ai/genkit)
 - Side-effect Genkit setup import
EXPORTS:
 - runtime ('nodejs')
 - POST (route handler)
*/

/* --sectionComment
SECTION: RUNTIME
SUMMARY: Force Node.js runtime to avoid Edge crypto/env limitations with Genkit/Google AI.
*/
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
// --- FIX: Import new function and type, remove .js extension ---
import {
  extractAttributesFromText,
  type ExtractedFacets,
} from '@/ai/genkit';
import '@/ai/genkit'; // side-effect import ensures Genkit config runs exactly once

/* --sectionComment
SECTION: ENVIRONMENT CHECK
SUMMARY: Verify that the Gemini API key is present and warn if missing.
*/
const GEMINI_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!GEMINI_KEY) {
  console.error('[api/chat] ⚠ Missing GOOGLE_GENAI_API_KEY in environment');
}

/* --sectionComment
SECTION: ROUTE HANDLER (POST)
SUMMARY: Validate request, call Genkit, and return the full JSON "form".
*/
export async function POST(req: NextRequest) {
  const LOG_SCOPE = '[api/chat]';
  console.group(`${LOG_SCOPE} POST`);
  console.time(`${LOG_SCOPE} total`);

  try {
    // --- Environment Validation ---
    if (!GEMINI_KEY) {
      console.error(`${LOG_SCOPE} ❌ Missing GOOGLE_GENAI_API_KEY`);
      return NextResponse.json(
        { error: 'Missing Gemini API key. Please configure GOOGLE_GENAI_API_KEY.' },
        { status: 500 }
      );
    }

    // --- Parse Request (New Simpler Body) ---
    // We now expect a body like { userInput: "..." }
    const body = await req.json().catch(() => ({}));
    const userInput = body?.userInput;

    if (!userInput) {
      return NextResponse.json({ error: 'No userInput provided' }, { status: 400 });
    }
    console.log(`${LOG_SCOPE} received userInput length:`, userInput.length);

    console.time(`${LOG_SCOPE} model latency`);

    // --- Call Genkit "Form-Filler" Flow ---
    const result: ExtractedFacets = await extractAttributesFromText(userInput);
    console.timeEnd(`${LOG_SCOPE} model latency`);

    console.log(`${LOG_SCOPE} model response (JSON):`, result);

    // --- Return Full JSON Response to Client ---
    // The client (chat-tab.tsx) will handle this JSON.
    console.log(`${LOG_SCOPE} ✅ success`);
    console.timeEnd(`${LOG_SCOPE} total`);
    console.groupEnd();
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error(`${LOG_SCOPE} ❌ POST error:`, err?.message || err);
    console.timeEnd(`${LOG_SCOPE} total`);
    console.groupEnd();
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}