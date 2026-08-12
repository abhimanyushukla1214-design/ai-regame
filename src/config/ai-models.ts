// Centralized Gemini AI Model & NEXUS Configuration

const isValidModelName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return (
    trimmed.startsWith('gemini-') ||
    trimmed.startsWith('veo-') ||
    trimmed.startsWith('lyria-')
  );
};

const getEnvVar = (nodeKey: string, viteKey: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[nodeKey]) {
    const val = (process.env[nodeKey] as string).trim();
    if (isValidModelName(val)) {
      return val;
    }
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    const val = (import.meta.env[viteKey] as string).trim();
    if (isValidModelName(val)) {
      return val;
    }
  }
  return fallback;
};

export const AI_CONFIG = {
  MODEL_FAST: getEnvVar('GEMINI_MODEL_FAST', 'VITE_GEMINI_MODEL_FAST', 'gemini-3.6-flash'),
  MODEL_CODE: getEnvVar('GEMINI_MODEL_CODE', 'VITE_GEMINI_MODEL_CODE', 'gemini-3.1-pro-preview'),
  MODEL_CREATIVE: getEnvVar('GEMINI_MODEL_CREATIVE', 'VITE_GEMINI_MODEL_CREATIVE', 'gemini-3.6-flash'),

  DEFAULT_TEMPERATURE: 0.7,
  CREATIVE_TEMPERATURE: 0.85,
  CODE_TEMPERATURE: 0.2,

  MAX_CODE_GEN_TOKENS: 8192,
  DEFAULT_DISCOVERY_LIMIT: 6,
};
