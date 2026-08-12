export interface WorldDomain {
  settingName: string;
  environmentType: string;
  atmosphere: string;
  keyLocations: string[];
  loreBackground: string;
}

export interface StoryDomain {
  logline: string;
  theme: string;
  incitingIncident: string;
  mainQuest: string;
  narrativeTone: string;
}

export interface CharacterDomain {
  protagonist: {
    name: string;
    role: string;
    motivation: string;
    abilities: string[];
  };
  antagonistOrHazard: {
    name: string;
    description: string;
  };
  keyNPCs?: {
    name: string;
    role: string;
  }[];
}

export interface GameplayDomain {
  coreLoop: string;
  primaryMechanics: string[];
  progressionSystem: string;
  winCondition: string;
  lossCondition: string;
  controls: {
    key: string;
    action: string;
  }[];
}

export interface PhysicsDomain {
  gravity: number;
  movementSpeed: number;
  jumpForce: number;
  friction: number;
  collisionType: string;
  environmentalHazards: string[];
}

export interface CinematographyDomain {
  cameraPerspective: '2D_SIDE_SCROLLER' | '2D_TOP_DOWN' | '2D_ISOMETRIC' | 'FIRST_PERSON' | 'THIRD_PERSON' | 'CANVAS_ARCADE';
  visualStyle: string;
  colorPalette: string[];
  lightingMood: string;
  uiStyle: string;
}

export interface AnimeVisualSpecification {
  visualStyle: string[];
  artDirection: string;
  colorPalette: string[];
  environment: {
    background: string[];
    midground: string[];
    gameplay: string[];
    foreground: string[];
    atmosphere: string[];
  };
  characterVisuals: {
    proportions: string;
    clothing: string[];
    accessories: string[];
  };
  animation: string[];
  camera: string[];
  lighting: string[];
  particles: string[];
  effects: string[];
  composition: string[];
  uiDirection: string;
  motionDirection: string;
}

export interface MotionSpecification {
  acceleration: number;
  deceleration: number;
  maximumSpeed: number;
  jump: number;
  gravity: number;
  airControl: number;
  friction: number;
  dash: number;
  knockback: number;
  animationSpeed: number;
  cameraResponse: string[];
  environmentalMovement: string[];
}

export interface VehicleDef {
  name: string;
  weight: number;
  power: number;
  grip: number;
  fuelCapacity: number;
}

export interface ResourceDef {
  name: string;
  capacity: number;
  consumptionRate: number;
  replenishMethod: string;
}

export interface GenreExtensions {
  vehiclePhysics?: {
    vehicleRoster: VehicleDef[];
    engine: { power: number; maxSpeed: number; acceleration: number };
    suspension: { strength: number; damping: number };
    wheels: { radius: number; friction: number; grip: number };
    fuel: { capacity: number; consumptionRate: number };
    brakePower: number;
    airControl: number;
  };
  resourceSystems?: {
    fuel?: ResourceDef;
    ammo?: ResourceDef;
    stamina?: ResourceDef;
  };
  trickSystem?: {
    tricks: { name: string; scoreValue: number }[];
    comboRules: string;
  };
  progressionSystem?: {
    upgradeCategories: { name: string; effect: string; levels: number }[];
    unlockables: { type: "vehicle" | "environment" | "cosmetic"; name: string; requirement: string }[];
  };
  terrainGeneration?: {
    method: "noise" | "spline" | "chunked" | "handcrafted";
    features: string[];
    difficultyRamp: { distance: number; label: string }[];
  };
}

export interface GameIdentity {
  archetype: 'SNAKE' | 'TETRIS' | 'PLATFORMER' | 'ENDLESS_RUNNER' | 'FLAPPY_STYLE' | 'TOP_DOWN_SHOOTER' | 'SPACE_SHOOTER' | 'RACING' | 'PUZZLE' | 'BREAKOUT' | 'PONG' | 'FIGHTING' | 'SURVIVAL' | 'ADVENTURE' | 'RPG' | 'STRATEGY' | 'TOWER_DEFENSE' | 'HORROR' | 'STEALTH' | 'SIMULATION' | 'CUSTOM';
  subtype: string;
  genre: string;
  perspective: string;
  cameraMode: string;
  coreGameplayLoop: string;
  physicsModel: string;
  controlModel: string;
  progressionModel: string;
}

export interface SpecEntity {
  id: string;
  name: string;
  type: 'player' | 'enemy' | 'NPC' | 'collectible' | 'projectile' | 'obstacle' | 'platform' | 'environment object' | 'goal' | 'hazard' | 'power-up';
  purpose: string;
  visualIdentity: {
    shape: string;
    color: string;
    textureStyle?: string;
    details?: string[];
  };
  size: { width: number; height: number; depth?: number };
  positionSpawnRules: string;
  movement: string;
  collision: string;
  interaction: string;
  animation: string;
  state: string;
}

export interface EntitySystem {
  entities: SpecEntity[];
}

export interface GameRules {
  spawning: string;
  movement: string;
  collision: string;
  scoring: string;
  health: string;
  damage: string;
  progression: string;
  win: string;
  loss: string;
  restart: string;
  pause: string;
  difficulty: string;
}

export interface UiUxSpecification {
  screens: {
    startScreen: {
      title: string;
      description: string;
      instructionCard: string;
      controls: string;
      objective: string;
      entityIntroduction: string[];
    };
    hud: {
      score: boolean;
      health: boolean;
      timer: boolean;
      pauseButton: boolean;
      restartButton: boolean;
      homeButton: boolean;
    };
    gameOverScreen: {
      title: string;
      options: string[];
    };
    victoryScreen: {
      title: string;
      options: string[];
    };
  };
  layout: {
    type: string;
    responsiveDesign: string;
    safeZones: string;
  };
}

export interface ComprehensiveGameSpec {
  gameId: string;
  originalPrompt?: string;
  generationFingerprint?: string;
  title: string;
  world: WorldDomain;
  story: StoryDomain;
  character: CharacterDomain;
  gameplay: GameplayDomain;
  physics: PhysicsDomain;
  cinematography: CinematographyDomain;
  animeVisual?: AnimeVisualSpecification;
  motion?: MotionSpecification;
  genreExtensions?: GenreExtensions;
  gameIdentity?: GameIdentity;
  entitySystem?: EntitySystem;
  gameRules?: GameRules;
  uiUxSpecification?: UiUxSpecification;
}
