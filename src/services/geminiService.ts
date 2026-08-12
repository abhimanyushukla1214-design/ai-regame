import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { AI_CONFIG } from '../config/ai-models.js';

let aiInstance: GoogleGenAI | null = null;
let lastApiKey: string | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';

  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Please configure your Gemini API Key in Settings > Secrets.'
    );
  }

  if (!aiInstance || lastApiKey !== apiKey) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    lastApiKey = apiKey;
  }
  return aiInstance;
}

export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  return Boolean(apiKey);
}

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}

export interface GenerateStructuredOptions<T> extends GenerateTextOptions {
  schema: Record<string, unknown>;
}

export interface GeminiServiceResult<T> {
  data: T;
  rawText: string;
  modelUsed: string;
  processingTimeMs: number;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateText(
  options: GenerateTextOptions
): Promise<GeminiServiceResult<string>> {
  const startTime = Date.now();
  const ai = getGeminiClient();
  const preferredModel = options.model || AI_CONFIG.MODEL_FAST;

  // Compile a list of unique models to try in order of preference
  const modelsToTry = [
    preferredModel,
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview',
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

  let lastError: any;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? AI_CONFIG.DEFAULT_TEMPERATURE,
          },
        });

        const text = response.text || '';
        return {
          data: text,
          rawText: text,
          modelUsed: model,
          processingTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;
        const errStr = error instanceof Error ? error.message : String(error);
        const isRateLimit = errStr.includes('429') || errStr.includes('503') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand');
        
        if (
          errStr.includes('401') ||
          errStr.includes('UNAUTHENTICATED') ||
          errStr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
          errStr.includes('API_KEY_INVALID')
        ) {
          throw new Error(
            'Gemini API authentication failed (401). Please check or update your API Key in Settings > Secrets.'
          );
        }

        if (isRateLimit) {
          console.warn(`[NEXUS GeminiService] generateText rate limited/quota hit for model ${model} (attempt ${attempt}).`);
          if (attempt < 2) {
            console.log(`Retrying model ${model} in 1.5s...`);
            await delay(1500);
            continue;
          } else {
            console.log(`Model ${model} was busy or rate-limited. Transitioning to next fallback option...`);
          }
        } else {
          console.log(`[NEXUS GeminiService] generateText busy for model ${model}. Moving to fallback...`);
          break; // Stop retrying this model, move to next model
        }
      }
    }
  }
  throw lastError;
}

export async function generateStructuredJson<T = unknown>(
  options: GenerateStructuredOptions<T>
): Promise<GeminiServiceResult<T>> {
  const startTime = Date.now();
  const ai = getGeminiClient();
  const preferredModel = options.model || AI_CONFIG.MODEL_FAST;

  // Compile a list of unique models to try in order of preference
  const modelsToTry = [
    preferredModel,
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.1-pro-preview',
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

  let lastError: any;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? AI_CONFIG.DEFAULT_TEMPERATURE,
            responseMimeType: 'application/json',
            responseSchema: options.schema as any,
          },
        });

        const rawText = response.text || '{}';
        let parsed: T;
        try {
          parsed = JSON.parse(rawText) as T;
        } catch (parseError) {
          console.error(`[NEXUS GeminiService] Failed to parse JSON response for model ${model}:`, rawText);
          throw new Error(`Failed to parse structured JSON response from Gemini: ${(parseError as Error).message}`);
        }

        return {
          data: parsed,
          rawText,
          modelUsed: model,
          processingTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;
        const errStr = error instanceof Error ? error.message : String(error);
        const isRateLimit = errStr.includes('429') || errStr.includes('503') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand');
        
        if (
          errStr.includes('401') ||
          errStr.includes('UNAUTHENTICATED') ||
          errStr.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
          errStr.includes('API_KEY_INVALID')
        ) {
          throw new Error(
            'Gemini API authentication failed (401). Please check or update your API Key in Settings > Secrets.'
          );
        }

        if (isRateLimit) {
          console.warn(`[NEXUS GeminiService] generateStructuredJson rate limited/quota hit for model ${model} (attempt ${attempt}).`);
          if (attempt < 2) {
            console.log(`Retrying model ${model} in 1.5s...`);
            await delay(1500);
            continue;
          } else {
            console.log(`Model ${model} was busy or rate-limited. Transitioning to next fallback option...`);
          }
        } else {
          console.log(`[NEXUS GeminiService] generateStructuredJson busy for model ${model}. Moving to fallback...`);
          break; // Stop retrying this model, try next model
        }
      }
    }
  }
  throw lastError;
}
