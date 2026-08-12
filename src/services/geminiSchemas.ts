import { Type } from '@google/genai';

// 1. Schema for Phase 2 AI Test operation
export const aiTestResponseSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: 'Concise summary or response from Gemini verifying operational status.',
    },
    status: {
      type: Type.STRING,
      description: 'Operational status text, e.g., "operational" or "verified".',
    },
  },
  required: ['message', 'status'],
};

// 2. Schema preview for future Game Discovery Intent parsing (Phase 6)
export const discoveryIntentSchema = {
  type: Type.OBJECT,
  properties: {
    extractedGenres: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Extracted game genres, e.g. ["Sci-Fi", "Survival", "Exploration"]',
    },
    extractedThemes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Extracted atmospheric themes, e.g. ["Isolation", "Mystery", "Deep Space"]',
    },
    desiredMechanics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key gameplay mechanics mentioned or implied',
    },
    pacing: {
      type: Type.STRING,
      description: 'Pacing type, e.g. "Fast-paced", "Atmospheric / Slow-burn", "Tactical"',
    },
  },
  required: ['extractedGenres', 'extractedThemes', 'desiredMechanics', 'pacing'],
};

// 3. Schema for Game Director MVP (Phase 4)
export const gameDirectorPlanSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        genre: { type: Type.ARRAY, items: { type: Type.STRING } },
        theme: { type: Type.ARRAY, items: { type: Type.STRING } },
        setting: { type: Type.STRING },
        playerRole: { type: Type.STRING },
        cameraPerspective: { type: Type.STRING },
        gameplayStyle: { type: Type.ARRAY, items: { type: Type.STRING } },
        atmosphere: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['summary', 'genre', 'theme', 'setting', 'playerRole', 'cameraPerspective', 'gameplayStyle', 'atmosphere'],
    },
    designDomains: {
      type: Type.OBJECT,
      properties: {
        world: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            requiredInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          },
          required: ['objective', 'requiredInputs', 'expectedOutputs', 'priority']
        },
        story: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            requiredInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          },
          required: ['objective', 'requiredInputs', 'expectedOutputs', 'priority']
        },
        character: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            requiredInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          },
          required: ['objective', 'requiredInputs', 'expectedOutputs', 'priority']
        },
        gameplay: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            requiredInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          },
          required: ['objective', 'requiredInputs', 'expectedOutputs', 'priority']
        },
        physics: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            requiredInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          },
          required: ['objective', 'requiredInputs', 'expectedOutputs', 'priority']
        },
        cinematography: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            requiredInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedOutputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          },
          required: ['objective', 'requiredInputs', 'expectedOutputs', 'priority']
        },
      },
      required: ['world', 'story', 'character', 'gameplay', 'physics', 'cinematography'],
    },
    constraints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Constraints explicitly requested by the user.',
    },
    assumptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Inferences or assumptions made by the director, not explicitly requested.',
    },
  },
  required: ['intent', 'designDomains', 'constraints', 'assumptions'],
};

// 4. Schema for Discovery Explanation (Phase 5)
export const discoveryExplanationSchema = {
  type: Type.OBJECT,
  properties: {
    games: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          matchReason: { type: Type.STRING },
          keyDifferences: { type: Type.STRING }
        },
        required: ['id', 'matchReason', 'keyDifferences']
      }
    },
    aiAnalysis: { type: Type.STRING }
  },
  required: ['games', 'aiAnalysis']
};


export const animeVisualSpecificationSchema = {
  type: Type.OBJECT,
  properties: {
    visualStyle: { type: Type.ARRAY, items: { type: Type.STRING } },
    artDirection: { type: Type.STRING },
    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
    environment: {
      type: Type.OBJECT,
      properties: {
        background: { type: Type.ARRAY, items: { type: Type.STRING } },
        midground: { type: Type.ARRAY, items: { type: Type.STRING } },
        gameplay: { type: Type.ARRAY, items: { type: Type.STRING } },
        foreground: { type: Type.ARRAY, items: { type: Type.STRING } },
        atmosphere: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['background', 'midground', 'gameplay', 'foreground', 'atmosphere']
    },
    characterVisuals: {
      type: Type.OBJECT,
      properties: {
        proportions: { type: Type.STRING },
        clothing: { type: Type.ARRAY, items: { type: Type.STRING } },
        accessories: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['proportions', 'clothing', 'accessories']
    },
    animation: { type: Type.ARRAY, items: { type: Type.STRING } },
    camera: { type: Type.ARRAY, items: { type: Type.STRING } },
    lighting: { type: Type.ARRAY, items: { type: Type.STRING } },
    particles: { type: Type.ARRAY, items: { type: Type.STRING } },
    effects: { type: Type.ARRAY, items: { type: Type.STRING } },
    composition: { type: Type.ARRAY, items: { type: Type.STRING } },
    uiDirection: { type: Type.STRING },
    motionDirection: { type: Type.STRING }
  },
  required: ['visualStyle', 'artDirection', 'colorPalette', 'environment', 'characterVisuals', 'animation', 'camera', 'lighting', 'particles', 'effects', 'composition', 'uiDirection', 'motionDirection']
};

export const motionSpecificationSchema = {
  type: Type.OBJECT,
  properties: {
    acceleration: { type: Type.NUMBER },
    deceleration: { type: Type.NUMBER },
    maximumSpeed: { type: Type.NUMBER },
    jump: { type: Type.NUMBER },
    gravity: { type: Type.NUMBER },
    airControl: { type: Type.NUMBER },
    friction: { type: Type.NUMBER },
    dash: { type: Type.NUMBER },
    knockback: { type: Type.NUMBER },
    animationSpeed: { type: Type.NUMBER },
    cameraResponse: { type: Type.ARRAY, items: { type: Type.STRING } },
    environmentalMovement: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['acceleration', 'deceleration', 'maximumSpeed', 'jump', 'gravity', 'airControl', 'friction', 'dash', 'knockback', 'animationSpeed', 'cameraResponse', 'environmentalMovement']
};
