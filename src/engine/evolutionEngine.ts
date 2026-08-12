import { UniverseState, GameEvent, GameSession } from '../types/universe.js';

export class EvolutionEngine {
  static processSession(universe: UniverseState, session: GameSession): UniverseState {
    const newState = { ...universe };
    newState.playerState = { ...newState.playerState };
    newState.playerState.statistics = { ...newState.playerState.statistics };
    
    let stateChanged = false;
    let scoreGained = 0;
    
    // Calculate session time
    const sessionTime = Math.floor(((session.endedAt || Date.now()) - session.startedAt) / 1000);
    newState.playerState.statistics.playTimeSeconds += sessionTime;
    
    for (const event of session.events) {
      switch (event.type) {
        case 'ITEM_COLLECTED':
          newState.playerState.statistics.itemsCollected++;
          scoreGained += 10;
          break;
        case 'SCORE_UPDATED':
          if (event.payload && typeof event.payload.score === 'number') {
             // We can just track final score or diff.
          }
          break;
        case 'PLAYER_DIED':
          newState.playerState.statistics.deaths++;
          break;
        case 'GAME_COMPLETED':
          if (!newState.playerState.completedObjectives.includes('MAIN_OBJECTIVE')) {
            newState.playerState.completedObjectives.push('MAIN_OBJECTIVE');
            stateChanged = true;
          }
          break;
      }
    }
    
    newState.playerState.score += scoreGained;

    // Simple deterministic evolution trigger
    if (stateChanged) {
      newState.version += 1;
      newState.evolutionHistory.push({
        version: newState.version,
        timestamp: Date.now(),
        triggerEvent: 'SESSION_COMPLETED',
        changes: ['Player completed main objective.', 'Universe advanced.']
      });
    }

    return newState;
  }
}
