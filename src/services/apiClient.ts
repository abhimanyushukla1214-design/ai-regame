import { ComprehensiveGameSpec } from '../types/nexusSpec.js';
import {
  ApiResponse,
  OrchestrateRequest,
  OrchestrateResponse, GameDirectorPlan,
  GameDiscoveryRequest,
  GameDiscoveryResponse,
  PlayerFeedbackRequest,
} from '../types/nexus';

async function parseApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!contentType.includes("application/json")) {
    const preview = text.substring(0, 200).replace(/\r?\n|\r/g, " ");
    throw new Error(
      `API client received non-JSON response from endpoint: ${response.url}
      [Status]: ${response.status} ${response.statusText}
      [Content-Type]: ${contentType}
      [Body Preview]: ${preview}...`
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `API returned invalid JSON from ${response.url}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.error ||
      `API request failed with HTTP ${response.status}`
    );
  }

  return data;
}

class NexusApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/nexus';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await parseApiResponse(response);
      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`[NEXUS API Client Error] ${endpoint}:`, error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'API request failed.',
        },
      };
    }
  }

  async checkHealth(): Promise<ApiResponse<{ status: string; app: string; geminiConfigured?: boolean }>> {
    return this.request('/health');
  }

  async testAi(prompt: string): Promise<ApiResponse<{ message: string; status: string; modelUsed: string; executionTimeMs: number }>> {
    return this.request('/ai-test', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async orchestrateUniverse(payload: OrchestrateRequest): Promise<ApiResponse<GameDirectorPlan>> {
    return this.request('/orchestrate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async discoverGames(payload: GameDiscoveryRequest): Promise<ApiResponse<GameDiscoveryResponse>> {
    return this.request('/discover', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  
  async generateSpec(payload: { plan: GameDirectorPlan }): Promise<ApiResponse<ComprehensiveGameSpec>> {
    return this.request('/generate-spec', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async buildGame(payload: { spec: ComprehensiveGameSpec }): Promise<ApiResponse<{ html: string }>> {
    return this.request('/build-game', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async evolveGame(payload: { currentSpec: ComprehensiveGameSpec; feedback: string }): Promise<ApiResponse<{ changes: string[]; updatedSpec: ComprehensiveGameSpec; html: string }>> {
    return this.request('/evolve-game', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async evolveUniverse(payload: PlayerFeedbackRequest): Promise<ApiResponse<unknown>> {
    return this.request('/evolve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const nexusApi = new NexusApiClient();
