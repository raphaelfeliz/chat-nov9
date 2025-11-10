/* *file-summary*
PATH: src/core/ai/genkit.ts
PURPOSE: Configure Genkit/Gemini to act as a structured JSON "form-filler" AND Q&A assistant.
SUMMARY: Initializes Gemini 2.5-flash and defines `extractAttributesFromText`.
         This flow performs four tasks:
         1) Facet Extraction: Extracts product attributes.
         2) Q&A: Answers factual questions using an injected Knowledge Base.
         3) Contact Extraction: Passively extracts user's name, email, and phone.
         4) Handover Intent: Detects if the user wants to talk to a human.
         It forces Gemini to return all keys (11 total) with extracted values or null.
         This file contains bug fixes to the system prompt.
RELATES TO OTHER FILES:
- This is the "Dual-Task AI" logic.
- It reads its Q&A data from `./aiKnowledgeBase.yaml` (co-located).
- It is imported and called by the API route at `src/app/api/chat/route.ts`.
- It provides the `ExtractedFacets` type, which is used by `src/core/state/ConfiguratorContext.tsx`.
IMPORTS:
- genkit (core client)
- googleAI (Gemini plugin)
- z (Zod for schema definition)
- fs, path (Node.js for reading the Knowledge Base)
*/

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// --- UPDATED (Phase 3.1.1) ---
// Added 'talkToHuman' field to the interface
export interface ExtractedFacets {
  categoria: string | null;
  sistema: string | null;
  persiana: string | null;
  persianaMotorizada: string | null;
  material: string | null;
  folhasNumber: string | null;
  knowledgeBaseAnswer: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  // --- NEW ---
  talkToHuman: boolean | null;
}

// --- UPDATED (Phase 3.1.1) ---
// The Zod schema Genkit uses to force Gemini's JSON output structure.
// Added 'talkToHuman' field to the schema.
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
  userName: z
    .string()
    .nullable()
    .describe(
      "O nome próprio do usuário (ex: 'Meu nome é João', 'Sou a Maria')."
    ),
  userEmail: z
    .string()
    .nullable()
    .describe(
      "O email do usuário (ex: 'meu email é teste@gmail.com')."
    ),
  userPhone: z
    .string()
    .nullable()
    .describe(
      "O telefone ou WhatsApp do usuário (ex: 'meu whats é 11 99999-8888')."
    ),
  // --- NEW (Phase 3.1.1) ---
  talkToHuman: z
    .boolean()
    .nullable()
    .describe(
      "Defina como 'true' se o usuário pedir para falar com um 'humano', 'atendente', 'especialista' ou 'vendedor'. Caso contrário, 'null'."
    ),
});

/* --sectionComment
SECTION: GENKIT CLIENT CONFIG
*/
console.group('[genkit]');
console.time('[genkit] init');
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash-lite',
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
    // --- REFACTOR: Updated path to new 'core' structure ---
    const kbPath = path.resolve(process.cwd(), 'src/core/ai/aiKnowledgeBase.yaml');
    const fileContent = fs.readFileSync(kbPath, 'utf8');
    console.log(`${LOG_SCOPE} ✅ Loaded aiKnowledgeBase.yaml`);
    return fileContent;
  } catch (err) {
    console.error(`${LOG_SCOPE} ❌ ERROR: Could not read aiKnowledgeBase.yaml.`, err);
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

  // --- UPDATED (Bug Fix) ---
  // The system prompt now includes stricter rules for TAREFA 2 and 4
  const systemInstruction = `
Você é um assistente co-piloto com quatro tarefas.
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

TAREFA 3: EXTRAÇÃO DE CONTATO
- Analise a mensagem do usuário em busca de informações de contato (nome, email, telefone/whatsapp).
- Extraia-os para os campos "userName", "userEmail", e "userPhone".
- Se não for mencionado, use 'null'.

TAREFA 4: INTENÇÃO DE TRANSFERÊNCIA
- Analise a mensagem do usuário em busca de um pedido claro para falar com um 'humano', 'atendente', 'especialista' ou 'vendedor'.
- Se essa intenção for detectada, defina "talkToHuman" como 'true'.
- Caso contrário, defina como 'null'.

---
BASE DE CONHECIMENTO (Use APENAS estes dados para responder):
${knowledgeBase}
---

REGRAS DE SAÍDA:
1. Sempre retorne um objeto JSON com estas exatas 11 chaves:
   "categoria"
   "sistema"
   "persiana"
   "persianaMotorizada"
   "material"
   "folhasNumber"
   "knowledgeBaseAnswer"
   "userName"
   "userEmail"
   "userPhone"
   "talkToHuman"

2.  Preencha todas as chaves, usando 'null' para qualquer uma que não for encontrada.

3.  --- REGRA DE BUG FIX ---
    SE a TAREFA 4 ("talkToHuman") for 'true',
    ENTÃO a TAREFA 2 ("knowledgeBaseAnswer") DEVE SER 'null'.
    Não responda à pergunta e nem confirme o pedido de falar com humano.
    O cliente (software) tratará da resposta.

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
  - "44" (se o usuário disser '4 folhas', 'quatro folhas') 
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
    return data as ExtractedFacets; // Cast to our interface
  } catch (err: any) {
    console.timeEnd(`${LOG_SCOPE} latency`);
    console.error(`${LOG_SCOPE} ❌ error:`, err?.message || err);
    console.groupEnd();

    // --- UPDATED (Phase 3.1.1) ---
    // Return a "safe" fallback object in case of error,
    // now including all 11 keys.
    return {
      categoria: null,
      sistema: null,
      persiana: null,
      persianaMotorizada: null,
      material: null,
      folhasNumber: null,
      knowledgeBaseAnswer: null,
      userName: null,
      userEmail: null,
      userPhone: null,
      talkToHuman: false, // Default to false on error
    };
  }
}