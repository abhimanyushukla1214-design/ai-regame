import { ComprehensiveGameSpec, GenreExtensions, GameIdentity } from './nexusSpec.js';
import { VisualGameSpecification, VisualExperienceSpecification } from '../agents/visualDesignAgent.js';

export interface GameBuildRequest {
  spec: ComprehensiveGameSpec;
}

export interface GameConfigurationOverrides {
  player?: {
    x?: number;
    y?: number;
    speed?: number;
    size?: number;
    health?: number;
    jump?: number;
  };
  items?: {
    quantity?: number;
    size?: number;
    spacing?: number;
  };
  enemies?: {
    quantity?: number;
    speed?: number;
    damage?: number;
  };
  physics?: {
    gravity?: number;
    friction?: number;
  };
  difficulty?: {
    level?: number;
  };
}

export interface PlayableGameDefinition {
  visuals: VisualGameSpecification;
  visualExperience?: VisualExperienceSpecification;
  genreExtensions?: GenreExtensions;
  gameIdentity?: GameIdentity;
  seed: string;
  objectives: string[];
  title: string;
  gameType: 'RACING' | 'PLATFORMER' | 'TOP_DOWN' | 'UNKNOWN';
  theme: {
    background: string;
    player: string;
    platform: string;
    enemy: string;
    collectible: string;
    particle: string;
  };
  physics: {
    gravity: number;
    jumpForce: number;
    movementSpeed: number;
    friction: number;
  };
  world: {
    width: number;
    height: number;
  };
  player: {
    width: number;
    height: number;
    startX: number;
    startY: number;
    shape: 'rect' | 'circle' | 'triangle';
  };
  entities: {
    platforms: Array<{x: number, y: number, width: number, height: number, type?: string}>;
    enemies: Array<{x: number, y: number, width: number, height: number, speedX: number, speedY: number, shape?: string}>;
    collectibles: Array<{x: number, y: number, width: number, height: number}>;
    portal: {x: number, y: number, width: number, height: number};
    obstacles?: Array<{x: number, y: number, width: number, height: number}>;
    checkpoints?: Array<{x: number, y: number, width: number, height: number}>;
  };
  winCondition: string;
  loseCondition: string;
  controls: Array<{key: string, action: string}>;
  cameraFollow: 'X' | 'Y' | 'BOTH' | 'NONE';
  overrides?: GameConfigurationOverrides;
}

export interface GameBuildResult {
  success: boolean;
  generationMode?: string;
  generationReason?: string;
  definition?: PlayableGameDefinition;
  html?: string;
  error?: string;
}
