export class Visuals {
  renderEntity(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, color: string, size: number) {
    ctx.fillStyle = color;
    if (type === 'player') {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }
  }
}
