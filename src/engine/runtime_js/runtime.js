class GameRuntime {
  constructor(config) {
    this.config = config;
    this.state = 'INTRO';
    this.input = new InputManager();
    this.particles = new ParticleSystem();
    this.visuals = new Visuals();
    this.debug = true;
    this.entities = {
        player: null,
        collectibles: [],
        hazards: [],
        environment: []
    };
  }

  initialize(ctx) {
    this.ctx = ctx;
  }
  
  handleInput() {}
  
  update(dt) {}
  
  render(ctx) {
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;

    ctx.fillStyle = this.config.colors.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.particles.render(ctx);
  }
  
  reset() {}
  pause() { this.state = 'PAUSED'; }
  resume() { this.state = 'PLAYING'; }
  destroy() { this.input.destroy(); }

  gridToScreen(x, y, cellSize) {
    return { x: x * cellSize, y: y * cellSize };
  }
}
