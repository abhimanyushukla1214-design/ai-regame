import { GameBuildRequest, GameBuildResult, PlayableGameDefinition } from '../types/gameBuilder.js';
import { generateGameHTML } from './template.js';
import { generateVisualSpecification, generateVisualExperience } from '../agents/visualDesignAgent.js';

export function validateGameSpec(spec: any): string | null {
  if (!spec) return 'Game Specification is missing.';
  if (!spec.title) return 'Game title is missing.';
  if (!spec.world || !spec.world.settingName) return 'World setting is missing.';
  if (!spec.gameplay || !spec.gameplay.controls) return 'Controls are missing.';
  if (!spec.gameplay.winCondition && !spec.gameplay.lossCondition) return 'Objectives (win/lose conditions) are missing.';
  if (!spec.physics) return 'Physics domain is missing.';
  if (!spec.cinematography) return 'Cinematography domain is missing.';
  return null;
}

export async function buildGame(request: GameBuildRequest): Promise<GameBuildResult> {
  const err = validateGameSpec(request.spec);
  if (err) {
    return { success: false, error: err };
  }

  const spec = request.spec;
  const archetype = spec.gameIdentity?.archetype;
  let gameType: 'RACING' | 'PLATFORMER' | 'TOP_DOWN' = 'PLATFORMER';

  if (archetype) {
    if (archetype === 'RACING') {
      gameType = 'RACING';
    } else if (['SNAKE', 'TETRIS', 'PONG', 'BREAKOUT', 'PUZZLE', 'TOP_DOWN_SHOOTER', 'SPACE_SHOOTER', 'SURVIVAL', 'ADVENTURE', 'STEALTH'].includes(archetype)) {
      gameType = 'TOP_DOWN';
    } else if (['PLATFORMER', 'ENDLESS_RUNNER', 'FLAPPY_STYLE'].includes(archetype)) {
      gameType = 'PLATFORMER';
    } else {
      const isTopDown = spec.cinematography.cameraPerspective === '2D_TOP_DOWN';
      const primaryMechanics = spec.gameplay.primaryMechanics?.join(' ').toLowerCase() || '';
      const coreLoop = spec.gameplay.coreLoop?.toLowerCase() || '';
      const logline = spec.story?.logline?.toLowerCase() || '';
      if (primaryMechanics.includes('racing') || coreLoop.includes('race') || logline.includes('racing')) {
        gameType = 'RACING';
      } else if (isTopDown) {
        gameType = 'TOP_DOWN';
      }
    }
  } else {
    const isTopDown = spec.cinematography.cameraPerspective === '2D_TOP_DOWN';
    const primaryMechanics = spec.gameplay.primaryMechanics?.join(' ').toLowerCase() || '';
    const coreLoop = spec.gameplay.coreLoop?.toLowerCase() || '';
    const logline = spec.story?.logline?.toLowerCase() || '';

    if (primaryMechanics.includes('racing') || coreLoop.includes('race') || logline.includes('racing')) {
      gameType = 'RACING';
    } else if (isTopDown) {
      gameType = 'TOP_DOWN';
    }
  }

  const hasEnemies = spec.character.antagonistOrHazard?.name ? true : false;

  let cameraFollow: 'X' | 'Y' | 'BOTH' | 'NONE' = 'BOTH';
  if (gameType === 'RACING') cameraFollow = 'X';
  else if (gameType === 'PLATFORMER') cameraFollow = 'X';

  let playerShape: 'rect' | 'circle' | 'triangle' = 'rect';
  if (gameType === 'RACING') playerShape = 'triangle';
  else if (spec.character?.protagonist?.role?.toLowerCase().includes('astronaut')) playerShape = 'circle';

  
  const visuals = generateVisualSpecification(spec);
  const visualExperience = generateVisualExperience(spec);
  
  // Seeded Random Helper
  let seed = spec.gameId.split('-')[0] || '12345';
  let seedVal = parseInt(seed, 16);
  function random() {
    let t = seedVal += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  let platforms: any[] = [];
  let enemies: any[] = [];
  let collectibles: any[] = [];
  let obstacles: any[] = [];
  let portal = { x: 0, y: 0, width: 60, height: 100 };
  let checkpoints: any[] = [];

  const worldWidth = gameType === 'RACING' ? 20000 : (gameType === 'TOP_DOWN' ? 3000 : 4000);
  const worldHeight = gameType === 'TOP_DOWN' ? 3000 : 1500;

  const specString = JSON.stringify(spec).toLowerCase();
  const overrideHealth = specString.includes('no health') || specString.includes('no damage') || specString.includes('no hp') || specString.includes('invincible') || specString.includes('no hazard');
  const overrideScore = specString.includes('no score') || specString.includes('no points') || specString.includes('no collectibles') || specString.includes('no coin');

  if (gameType === 'RACING') {
    platforms = [
      { x: -500, y: 700, width: worldWidth + 1000, height: 400, type: 'road' }
    ];
    if (!overrideHealth) {
      for (let i = 1; i < 25; i++) {
        obstacles.push({ x: i * 800 + random() * 200, y: 710 + random() * 200, width: 40, height: 40 });
      }
    }
    portal = { x: worldWidth - 500, y: 700, width: 200, height: 400 };
  } else if (gameType === 'TOP_DOWN') {
    platforms = [
      { x: -500, y: -500, width: worldWidth + 1000, height: worldHeight + 1000, type: 'floor' },
    ];
    // Generate some walls and rooms
    for (let i=0; i<15; i++) {
       platforms.push({
         x: random() * (worldWidth - 200),
         y: random() * (worldHeight - 200),
         width: 100 + random() * 300,
         height: 50 + random() * 50,
         type: 'wall'
       });
       platforms.push({
         x: random() * (worldWidth - 200),
         y: random() * (worldHeight - 200),
         width: 50 + random() * 50,
         height: 100 + random() * 300,
         type: 'wall'
       });
    }

    if (!overrideHealth) {
      // Sentinel Enemies
      for (let i=0; i<12; i++) {
        enemies.push({ x: 500 + random() * (worldWidth-1000), y: 500 + random() * (worldHeight-1000), width: 30, height: 30, speedX: (random()-0.5)*3, speedY: (random()-0.5)*3, shape: 'circle' });
      }
      // Obstacles
      for (let i=0; i<10; i++) {
        obstacles.push({ x: 400 + random() * (worldWidth-800), y: 400 + random() * (worldHeight-800), width: 35, height: 35 });
      }
    }

    if (!overrideScore) {
      for (let i=0; i<20; i++) {
        collectibles.push({ x: 300 + random() * (worldWidth-600), y: 300 + random() * (worldHeight-600), width: 16, height: 16, type: 'collectible' });
      }
    }

    if (!overrideHealth) {
      // Health-depletion healing items
      for (let i=0; i<6; i++) {
        collectibles.push({ x: 300 + random() * (worldWidth-600), y: 300 + random() * (worldHeight-600), width: 20, height: 20, type: 'health' });
      }
    }

    portal = { x: worldWidth - 300, y: worldHeight - 300, width: 80, height: 80 };
  } else {
    // PLATFORMER (Seeded jump sequence)
    platforms.push({ x: -500, y: 1200, width: worldWidth + 1000, height: 300, type: 'floor' });
    
    let currentX = 300;
    let currentY = 1100;
    while (currentX < worldWidth - 500) {
      const w = 100 + random() * 200;
      platforms.push({ x: currentX, y: currentY, width: w, height: 20 });
      
      const r = random();
      if (!overrideHealth) {
        if (r > 0.6) {
          enemies.push({ x: currentX + w/2, y: currentY - 40, width: 30, height: 30, speedX: (random()>0.5?1:-1)*2, speedY: 0 });
        } else if (r > 0.3) {
          obstacles.push({ x: currentX + w/4, y: currentY - 35, width: 35, height: 35 });
        }
      }

      if (!overrideScore && random() > 0.25) {
        collectibles.push({ x: currentX + w/2, y: currentY - 80, width: 16, height: 16, type: 'collectible' });
      }

      if (!overrideHealth && random() > 0.75) {
        collectibles.push({ x: currentX + w/1.5, y: currentY - 80, width: 20, height: 20, type: 'health' });
      }
      
      currentX += w + 80 + random() * 150;
      currentY += (random() - 0.5) * 150;
      if (currentY > 1100) currentY = 1100;
      if (currentY < 400) currentY = 400;
    }
    portal = { x: currentX, y: currentY - 100, width: 60, height: 100 };
  }


  const definition: PlayableGameDefinition = {
    title: spec.title,
    visuals,
    visualExperience,
    genreExtensions: spec.genreExtensions,
    gameIdentity: spec.gameIdentity,
    seed,
    objectives: [spec.story.mainQuest || 'Survive', spec.gameplay.winCondition || 'Reach the end'],
    gameType,
    theme: {
      background: spec.cinematography.colorPalette?.[0] || '#111827',
      player: spec.cinematography.colorPalette?.[1] || '#06b6d4',
      platform: spec.cinematography.colorPalette?.[3] || '#374151',
      enemy: spec.cinematography.colorPalette?.[2] || '#ef4444',
      collectible: '#f59e0b',
      particle: spec.cinematography.colorPalette?.[2] || '#ffffff'
    },
    physics: {
      gravity: gameType === 'TOP_DOWN' ? 0 : (spec.physics.gravity || 9.8) / 16.3,
      jumpForce: (spec.physics.jumpForce || 10) * 1.2,
      movementSpeed: (spec.physics.movementSpeed || 5) * (gameType === 'RACING' ? 3 : 1.5),
      friction: spec.physics.friction || 0.8,
    },
    world: { width: worldWidth, height: worldHeight },
    player: { 
      width: gameType === 'RACING' ? 60 : 30, 
      height: gameType === 'RACING' ? 30 : 30, 
      startX: 100, 
      startY: gameType === 'TOP_DOWN' ? 100 : (gameType === 'RACING' ? 800 : 800),
      shape: playerShape
    },
    entities: {
      platforms,
      enemies,
      collectibles,
      portal,
      obstacles
    },
    winCondition: spec.gameplay.winCondition || "Reach the end",
    loseCondition: spec.gameplay.lossCondition || "Die",
    controls: spec.gameplay.controls || [],
    cameraFollow
  };

  try {
    const html = generateGameHTML(definition);
    return { 
      success: true, 
      definition, 
      html, 
      generationMode: 'ENGINE', 
      generationReason: 'Generated via unified engine pipeline derived from user intent specification.' 
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error generating HTML sandbox' };
  }
}
