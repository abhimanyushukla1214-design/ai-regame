import { UniverseState, GameSession, PlayerState } from '../types/universe.js';
import { ComprehensiveGameSpec } from '../types/nexusSpec.js';

const STORAGE_KEY_PREFIX = 'nexus_universe_';

export class UniverseStore {
  static create(spec: ComprehensiveGameSpec): UniverseState {
    const universeId = 'univ_' + Math.random().toString(36).substring(2, 9);
    
    const initialState: UniverseState = {
      universeId,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gameSpecificationId: spec.gameId || 'spec_' + Math.random().toString(36).substring(2, 9),
      playerState: {
        playerId: 'player_1',
        score: 0,
        health: 100,
        completedObjectives: [],
        discoveredAreas: [spec.world.settingName],
        statistics: {
          itemsCollected: 0,
          enemiesDefeated: 0,
          deaths: 0,
          playTimeSeconds: 0
        }
      },
      worldState: {
        discoveredLocations: [spec.world.settingName],
        clearedZones: []
      },
      evolutionHistory: [{
        version: 1,
        timestamp: Date.now(),
        triggerEvent: 'UNIVERSE_CREATED',
        changes: ['Initial universe manifestation']
      }]
    };
    
    this.save(initialState);
    return initialState;
  }

  static save(state: UniverseState): void {
    state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY_PREFIX + state.universeId, JSON.stringify(state));
  }

  static load(universeId: string): UniverseState | null {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + universeId);
    if (!data) return null;
    try {
      return JSON.parse(data) as UniverseState;
    } catch (e) {
      console.error('Failed to parse universe state', e);
      return null;
    }
  }

  static listAll(): UniverseState[] {
    const universes: UniverseState[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            universes.push(JSON.parse(data));
          } catch(e) {}
        }
      }
    }
    return universes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static delete(universeId: string): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + universeId);
  }
}
