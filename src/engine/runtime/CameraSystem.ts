export class CameraSystem {
  x: number = 0;
  y: number = 0;
  targetX: number = 0;
  targetY: number = 0;

  constructor(public width: number, public height: number) {}

  update(playerX: number, playerY: number, dt: number) {
    this.targetX = playerX - this.width / 2;
    this.targetY = playerY - this.height / 2;
    
    // Smooth follow
    this.x += (this.targetX - this.x) * dt * 5;
    this.y += (this.targetY - this.y) * dt * 5;
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, -this.x, -this.y);
  }

  reset(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
