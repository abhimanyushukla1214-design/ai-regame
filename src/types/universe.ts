export interface GameEvent {
  id: string;
  timestamp: number;
  type: 'PLAYER_MOVED' | 'PLAYER_JUMPED' | 'ITEM_COLLECTED' | 'OBJECTIVE_STARTED' | 'OBJECTIVE_COMPLETED' | 'ENTITY_DEFEATED' | 'AREA_DISCOVERED' | 'PLAYER_DIED' | 'GAME_COMPLETED' | 'SCORE_UPDATED';
  payload: any;
}

export interface PlayerState {
  playerId: string;
  score: number;
  health: number;
  completedObjectives: string[];
  discoveredAreas: string[];
  statistics: {
    itemsCollected: number;
    enemiesDefeated: number;
    deaths: number;
    playTimeSeconds: number;
  };
}

export interface EvolutionHistoryEntry {
  version: number;
  timestamp: number;
  triggerEvent: string;
  changes: string[];
}

export interface UniverseState {
  universeId: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  gameSpecificationId: string;
  playerState: PlayerState;
  worldState: {
    discoveredLocations: string[];
    clearedZones: string[];
  };
  evolutionHistory: EvolutionHistoryEntry[];
}

export interface GameSession {
  sessionId: string;
  universeId: string;
  playerId: string;
  startedAt: number;
  endedAt?: number;
  events: GameEvent[];
  currentState: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
}

export interface PlayerFeedback {
  rating: 'TOO_EASY' | 'TOO_HARD' | 'JUST_RIGHT';
  tags: string[];
  comments: string;
}

export interface EvolutionProposal {
  version: number;
  reasoning: string;
  suggestedChanges: string[];
  // If accepted, these changes get applied to the spec or universe state
}
