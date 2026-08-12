export class VisualDirectionAgent {
  static getVisuals(spec: any) {
    const archetype = spec.gameIdentity?.archetype;
    const theme = spec.theme || {};
    
    // Default visual specification
    let visuals: any = {
      palette: theme.colorPalette || { background: '#1a1a1a', player: '#ffffff', enemy: '#ff0000' },
      artStyle: 'geometric',
      atmosphere: 'neutral'
    };

    if (archetype === 'SNAKE') {
      visuals.artStyle = 'neon-grid';
      visuals.atmosphere = 'tech';
    } else if (archetype === 'PLATFORMER') {
      visuals.artStyle = 'silhouette';
      visuals.atmosphere = 'dynamic';
    }

    return visuals;
  }
}
