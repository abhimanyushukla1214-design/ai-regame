export interface Entity {
  id: string;
  type: 'player' | 'enemy' | 'collectible' | 'portal' | 'platform' | 'obstacle';
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'rect' | 'circle' | 'triangle';
  update(dt: number, entities: Entity[]): void;
  render(ctx: CanvasRenderingContext2D): void;
}
