import { buildGame } from '../engine/gameBuilder.js';
import { ComprehensiveGameSpec } from '../types/nexusSpec.js';
import { generateGameSpecification } from '../agents/gameSpecAgent.js';
import { evolveGameSpecification } from '../agents/evolutionAgent.js';
import { GameDirectorPlan } from '../types/nexus.js';
import { runDiscoveryPipeline } from '../agents/discoveryAgent.js';
import { orchestrateGameDirector } from '../agents/gameDirector.js';
import { runQaRepairAgent } from '../agents/qaRepairAgent.js';
import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, OrchestrateRequest, GameDiscoveryRequest, PlayerFeedbackRequest } from '../types/nexus.js';
import { AI_CONFIG } from '../config/ai-models.js';
import { isGeminiConfigured, generateStructuredJson } from '../services/geminiService.js';
import { aiTestResponseSchema } from '../services/geminiSchemas.js';

export const nexusRouter = Router();

// Utility for uniform API responses
function sendSuccess<T>(res: Response, data: T, phase: string, timingMs: number) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      processingTimeMs: timingMs,
      phase,
      modelsUsed: [AI_CONFIG.MODEL_FAST, AI_CONFIG.MODEL_CODE],
    },
  };
  res.json(response);
}

function sendError(res: Response, statusCode: number, code: string, message: string, details?: unknown) {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  res.status(statusCode).json(response);
}

// 1. Health Check Endpoint
nexusRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'NEXUS — AI Game Universe Engine',
    timestamp: new Date().toISOString(),
    geminiConfigured: isGeminiConfigured(),
    config: {
      modelFast: AI_CONFIG.MODEL_FAST,
      modelCode: AI_CONFIG.MODEL_CODE,
      modelCreative: AI_CONFIG.MODEL_CREATIVE,
    },
  });
});

// 2. AI Integration Test Endpoint (Phase 2)
nexusRouter.post('/ai-test', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { prompt } = req.body as { prompt?: string };

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "prompt" is required and must be a non-empty string.');
  }

  if (!isGeminiConfigured()) {
    return sendError(
      res,
      503,
      'MISSING_GEMINI_API_KEY',
      'Server configuration notice: GEMINI_API_KEY environment variable is not present. Configure key in Settings > Secrets.'
    );
  }

  try {
    const result = await generateStructuredJson<{ message: string; status: string }>({
      prompt: `Confirm operational readiness for NEXUS AI Game Universe with this test user input: "${prompt.trim()}".`,
      systemInstruction: 'You are the NEXUS AI System Diagnostic Engine. Respond concisely in structured JSON.',
      schema: aiTestResponseSchema,
      model: AI_CONFIG.MODEL_FAST,
    });

    return sendSuccess(
      res,
      {
        message: result.data.message,
        status: result.data.status,
        modelUsed: result.modelUsed,
        executionTimeMs: result.processingTimeMs,
      },
      'Phase 2 Gemini AI Service Layer',
      Date.now() - startTime
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to process AI test request';
    if (
      errorMsg.includes('401') ||
      errorMsg.includes('UNAUTHENTICATED') ||
      errorMsg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
      errorMsg.includes('API_KEY_INVALID') ||
      errorMsg.includes('unauthenticated')
    ) {
      return sendError(
        res,
        401,
        'UNAUTHENTICATED',
        'Gemini API authentication failed. Please check or attach your API key in Settings > Secrets.',
        { originalError: errorMsg }
      );
    }
    return sendError(res, 500, 'GEMINI_API_ERROR', errorMsg);
  }
});

// 3. Orchestrate Endpoint (Phase 4 MVP)
nexusRouter.post('/orchestrate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  // We expect userPrompt based on OrchestrateRequest
  const { userPrompt } = req.body as OrchestrateRequest;

  if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "userPrompt" is required and must be a non-empty string.');
  }

  if (!isGeminiConfigured()) {
    return sendError(
      res,
      503,
      'MISSING_GEMINI_API_KEY',
      'Server configuration notice: GEMINI_API_KEY environment variable is not present. Configure key in Settings > Secrets.'
    );
  }

  try {
    const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
    const plan = await orchestrateGameDirector(userPrompt, requestId);

    return sendSuccess(res, plan, 'Phase 4 Game Director Orchestration', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Orchestrator Error]', error);
    return sendError(res, 500, 'ORCHESTRATION_FAILED', 'NEXUS could not generate the design plan.');
  }
});

// 4. Discover Endpoint (Phase 5)
nexusRouter.post('/discover', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { naturalPrompt } = req.body as GameDiscoveryRequest;

  if (!naturalPrompt || typeof naturalPrompt !== 'string' || !naturalPrompt.trim()) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "naturalPrompt" is required and must be a non-empty string.');
  }

  if (!isGeminiConfigured()) {
    return sendError(
      res,
      503,
      'MISSING_GEMINI_API_KEY',
      'Server configuration notice: GEMINI_API_KEY environment variable is not present. Configure key in Settings > Secrets.'
    );
  }

  try {
    const discoveryResponse = await runDiscoveryPipeline(naturalPrompt, 3);
    return sendSuccess(res, discoveryResponse, 'Phase 5 Discovery Agent', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Discovery Error]', error);
    return sendError(res, 500, 'DISCOVERY_FAILED', 'NEXUS could not complete the discovery pipeline.');
  }
});


// Phase 6: Game Specification Pipeline
nexusRouter.post('/generate-spec', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { plan } = req.body as { plan: GameDirectorPlan };

  if (!plan) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "plan" is required.');
  }

  if (!isGeminiConfigured()) {
    return sendError(
      res,
      503,
      'MISSING_GEMINI_API_KEY',
      'Server configuration notice: GEMINI_API_KEY environment variable is not present. Configure key in Settings > Secrets.'
    );
  }

  try {
    const spec = await generateGameSpecification(plan);
    return sendSuccess(res, spec, 'Phase 6 Game Specification Generation', Date.now() - startTime);
  } catch (error) {
    console.error('[NEXUS Specification Error]', error);
    return sendError(res, 500, 'SPECIFICATION_FAILED', 'NEXUS could not generate the game specification.');
  }
});


// Phase 6: Game Builder (Deterministic Engine)
nexusRouter.post('/build-game', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { spec } = req.body as { spec: ComprehensiveGameSpec };

  if (!spec) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "spec" is required.');
  }

  const result = await buildGame({ spec });
  if (!result.success) {
    return sendError(res, 400, 'VALIDATION_FAILED', result.error || 'Game validation failed');
  }

  return sendSuccess(res, { html: result.html }, 'Phase 6 Game Builder', Date.now() - startTime);
});
// 6. QA Validate Endpoint (AI QA Agent / Repair System Implementation)
nexusRouter.post('/qa-validate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { spec, error } = req.body as { spec: ComprehensiveGameSpec; error?: string };

  if (!spec) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "spec" is required for QA Validation.');
  }

  try {
    const errorMsg = error || 'Pre-emptive validation and enhancement requested.';
    const repairResult = await runQaRepairAgent(spec, errorMsg);

    // Build the healed game to confirm it is fully playable
    const buildResult = await buildGame({ spec: repairResult.spec });
    
    return sendSuccess(
      res,
      {
        repairedSpec: repairResult.spec,
        explanation: repairResult.explanation,
        logs: repairResult.logs,
        html: buildResult.success ? buildResult.html : null,
        buildSuccess: buildResult.success,
        buildError: buildResult.success ? null : buildResult.error
      },
      'AI QA Healing & Validation System',
      Date.now() - startTime
    );
  } catch (err: any) {
    console.error('[NEXUS QA-Validate Endpoint Error]', err);
    return sendError(res, 500, 'QA_VALIDATION_FAILED', `QA Validation process failed: ${err.message || String(err)}`);
  }
});

// 7. Evolve Endpoint (Universe Evolution & Feedback Contract)
nexusRouter.post('/evolve', (req: Request, res: Response) => {
  const startTime = Date.now();
  const { gameId, feedbackText } = req.body as PlayerFeedbackRequest;

  if (!feedbackText) {
    return sendError(res, 400, 'INVALID_INPUT', 'Field "feedbackText" is required for universe evolution.');
  }

  return sendSuccess(
    res,
    {
      status: 'contract_stub',
      message: 'NEXUS Universe Evolution endpoint initialized (Phase 1 Stub).',
      gameId: gameId || 'new_game',
      feedbackReceived: feedbackText,
      nextPhase: 'Phase 15: Player Feedback & Universe Evolution',
    },
    'Phase 1 Base Framework',
    Date.now() - startTime
  );
});

// Centralized Error Middleware
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[NEXUS API Error]:', err);
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', err.message || 'An unexpected server error occurred.');
};


// Phase 8: Game Evolution endpoint
nexusRouter.post('/evolve-game', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { currentSpec, feedback } = req.body;

  if (!currentSpec || !feedback) {
    return sendError(res, 400, 'INVALID_INPUT', 'Fields "currentSpec" and "feedback" are required.');
  }

  if (!isGeminiConfigured()) {
    return sendError(res, 503, 'MISSING_GEMINI_API_KEY', 'Server configuration notice: GEMINI_API_KEY is not present.');
  }

  try {
    const result = await evolveGameSpecification(currentSpec, feedback);
    
    // Validate and rebuild
    const buildResult = await buildGame({ spec: result.updatedSpec });
    if (!buildResult.success) {
      return sendError(res, 500, 'BUILD_FAILED', 'Evolution resulted in an invalid game build.');
    }

    return sendSuccess(
      res,
      {
        changes: result.changes,
        updatedSpec: result.updatedSpec,
        html: buildResult.html
      },
      'Phase 8 Game Evolution',
      Date.now() - startTime
    );
  } catch (error) {
    const errStr = error instanceof Error ? error.message : String(error);
    if (errStr.includes('Evolution could not be completed')) {
      console.log('[NEXUS Evolution Warning]', errStr);
      return sendError(res, 429, 'EVOLUTION_RATE_LIMITED', errStr);
    }
    console.error('[NEXUS Evolution Error]', error);
    return sendError(res, 500, 'EVOLUTION_FAILED', 'NEXUS could not evolve the game specification.');
  }
});

