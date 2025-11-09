/*
*file-summary*
PATH: src/ai/genkit.ts
PURPOSE: Configure Genkit/Gemini to act as a structured JSON "form-filler" AND Q&A assistant.
SUMMARY: Initializes Gemini 2.5-flash and defines `extractAttributesFromText`.
         This flow now performs two tasks:
         1) Facet Extraction: Extracts product attributes into their respective keys.
         2) Q&A: Answers factual questions using an injected Knowledge Base,
            placing the answer in the new 'knowledgeBaseAnswer' key.
         It forces Gemini to return all keys (7 total) with extracted values or null.
IMPORTS:
 - genkit (core client)
 - googleAI (Gemini plugin)
 - z (Zod for schema definition)
 - fs, path (Node.js for reading the Knowledge Base)
EXPORTS:
 - ai (Genkit instance)
 - ExtractedFacets (Interface for the JSON structure)
 - extractAttributesFromText (async JSON-generation flow)
*/

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// --- MODIFIED (Step 1.1.1) ---
// Added 'knowledgeBaseAnswer' to the interface
export interface ExtractedFacets {
  categoria: string | null;
  sistema: string | null;
  persiana: string | null;
  persianaMotorizada: string | null;
  material: string | null;
  folhasNumber: string | null;
  knowledgeBaseAnswer: string | null;
}

// --- MODIFIED (Step 1.1.2) ---
// The Zod schema Genkit uses to force Gemini's JSON output structure.
// Added 'knowledgeBaseAnswer' to the schema.
const extractionSchema = z.object({
  categoria: z
    .string()
    .nullable()
    .describe('Identifique interesse por: "porta" ou "janela".'),
  sistema: z
    .string()
    .nullable()
    .describe(
      'Identifique interesse por: "janela-correr", "porta-correr", "giro", ou "maxim-ar".'
    ),
  persiana: z
    .string()
    .nullable()
    .describe('Identifique interesse: "sim" ou "nao".'),
  persianaMotorizada: z
    .string()
    .nullable()
    .describe('Identifique interesse: "motorizada" ou "manual".'),
  material: z
    .string()
    .nullable()
    .describe(
      'Identifique interesse por: "vidro", "vidro + veneziana", "lambri", "veneziana", ou "vidro + lambri".'
    ),
  folhasNumber: z
    .string()
    .nullable()
    .describe('Identifique o número de folhas (ex: "1", "2", "3", "4", "6").'),
  knowledgeBaseAnswer: z
    .string()
    .nullable()
    .describe(
      'Se o usuário fez uma pergunta (sobre garantia, entrega, etc.), responda aqui. Use APENAS a Base de Conhecimento. Se não houver pergunta, use "null".'
    ),
});

/* --sectionComment
SECTION: GENKIT CLIENT CONFIG
*/
console.group('[genkit]');
console.time('[genkit] init');
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
console.timeEnd('[genkit] init');
console.log('[genkit] ✅ Initialized Gemini 2.5-flash');
console.groupEnd();

/* --sectionComment
SECTION: KNOWLEDGE BASE LOADER
*/
function getKnowledgeBase(): string {
  const LOG_SCOPE = '[genkit→getKnowledgeBase]';
  try {
    const kbPath = path.resolve(process.cwd(), 'src/ai/ai_kb.yaml');
    const fileContent = fs.readFileSync(kbPath, 'utf8');
    console.log(`${LOG_SCOPE} ✅ Loaded ai_kb.yaml`);
    return fileContent;
  } catch (err) {
    console.error(`${LOG_SCOPE} ❌ ERROR: Could not read ai_kb.yaml.`, err);
    return 'Knowledge Base is unavailable.';
  }
}
const knowledgeBase = getKnowledgeBase();

/* --sectionComment
SECTION: AI DUAL-TASK "FORM-FILLER" FLOW
*/
export async function extractAttributesFromText(
  userInput: string
): Promise<ExtractedFacets> {
  const LOG_SCOPE = '[genkit→extractAttributesFromText]';
  console.group(`${LOG_SCOPE} call`);

  // --- MODIFIED (Step 1.1.3 & 1.1.4) ---
  // The system prompt is now a template literal that injects the
  // knowledgeBase variable and includes rules for the dual-task (Q&A + Facets).
  const systemInstruction = `
Você é um assistente co-piloto com duas tarefas.
Responda APENAS com um objeto JSON.

TAREFA 1: EXTRAÇÃO DE FACETAS
- Analise a mensagem do usuário para extrair atributos de produto.
- Use as "OPÇÕES VÁLIDAS PARA EXTRAÇÃO" abaixo.
- Se o usuário não mencionar uma opção para uma chave, use 'null' como valor.

TAREFA 2: PERGUNTAS E RESPOSTAS (Q&A)
- Analise a mensagem do usuário em busca de perguntas factuais (sobre garantia, entrega, etc.).
- Para responder, use APENAS o conteúdo da "BASE DE CONHECIMENTO" fornecida abaixo.
- Coloque a resposta no campo "knowledgeBaseAnswer".
- Se o usuário NÃO fizer uma pergunta factual, retorne 'null' para o campo "knowledgeBaseAnswer".

---
BASE DE CONHECIMENTO (Use APENAS estes dados para responder):
${knowledgeBase}
---

REGRAS DE SAÍDA:
1. Sempre retorne um objeto JSON com estas exatas 7 chaves:
   "categoria"
   "sistema"
   "persiana"
   "persianaMotorizada"
   "material"
   "folhasNumber"
   "knowledgeBaseAnswer"

2.  Preencha todas as chaves, usando 'null' para qualquer uma que não for encontrada.

---
OPÇÕES VÁLIDAS PARA EXTRAÇÃO (TAREFA 1):
- "categoria":
  - "porta" (se o usuário disser 'porta', 'portas')
  - "janela" (se o usuário disser 'janela', 'janelas')
- "sistema":
  - "janela-correr" (se o usuário disser 'janela de correr')
  - "porta-correr" (se o usuário disser 'porta de correr')
  - "maxim-ar" (se o usuário disser 'maxim-ar', 'maximar', 'basculante')
  - "giro" (se o usuário disser 'giro', 'de giro', 'de abrir')
- "persiana":
  - "sim" (se o usuário disser 'com persiana', 'persiana integrada', 'blackout')
  - "nao" (se o usuário disser 'sem persiana', 'só vidro')
- "persianaMotorizada":
  - "motorizada" (se o usuário disser 'motorizada', 'automática', 'controle remoto')
  - "manual" (se o usuário disser 'manual')
- "material":
  - "vidro" (se o usuário disser 'vidro')
  - "vidro + veneziana" (se o usuário disser 'vidro e veneziana')
  - "lambri" (se o usuário disser 'lambri', 'fechada')
  - "veneziana" (se o usuário disser 'veneziana', 'ventilada')
  - "vidro + lambri" (se o usuário disser 'vidro e lambri', 'metade vidro')
- "folhasNumber":
  - "1" (se o usuário disser '1 folha', 'uma folha')
  - "2" (se o usuário disser '2 folhas', 'duas folhas')
  - "3" (se o usuário disser '3 folhas', 'três folhas')
  - "4" (se o usuário disser '4 folhas', 'quatro folhas') 
  - "6" (se o usuário disser '6 folhas', 'seis folhas')
`;

  console.log(`${LOG_SCOPE} User Input:`, userInput);
  console.time(`${LOG_SCOPE} latency`);

  try {
    const response = await ai.generate({
      prompt: userInput,
      system: systemInstruction,
      output: {
        schema: extractionSchema,
        format: 'json',
      },
    });

    console.timeEnd(`${LOG_SCOPE} latency`);
    const data = response.output;

    if (!data) {
      throw new Error('No output data returned from AI.');
    }

    console.log(`${LOG_SCOPE} ✅ Success, returning JSON:`, data);
    console.groupEnd();
    return data;
  } catch (err: any) {
    console.timeEnd(`${LOG_SCOPE} latency`);
    console.error(`${LOG_SCOPE} ❌ error:`, err?.message || err);
    console.groupEnd();

    // --- MODIFIED ---
    // Return a "safe" fallback object in case of error,
    // now including the new key.
    return {
      categoria: null,
      sistema: null,
      persiana: null,
      persianaMotorizada: null,
      material: null,
      folhasNumber: null,
      knowledgeBaseAnswer: null,
    };
  }
}