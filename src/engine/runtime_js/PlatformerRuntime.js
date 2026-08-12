class PlatformerRuntime extends GameRuntime {
  constructor(config) {
    super(config);
    this.reset();
  }

  reset() {
    this.player = { x: 100, y: 100, vx: 0, vy: 0, width: 32, height: 32 };
    this.gravity = 0.5;
    this.state = 'PLAYING';
    this.entities.player = {type: 'person', pos: this.player};
  }

  handleInput() {
    if (this.state !== 'PLAYING') return;
    if (this.input.isDown('ArrowLeft') || this.input.isDown('a')) this.player.vx = -5;
    else if (this.input.isDown('ArrowRight') || this.input.isDown('d')) this.player.vx = 5;
    else this.player.vx = 0;
    
    if ((this.input.isDown('ArrowUp') || this.input.isDown('w') || this.input.isDown(' ')) && this.player.y >= 500) {
        this.player.vy = -10;
    }
  }

  update(dt) {
    this.particles.update(dt);
    if (this.state === 'PLAYING') {
      this.handleInput();
      this.player.vy += this.gravity;
      this.player.x += this.player.vx;
      this.player.y += this.player.vy;
      // Simple floor collision
      if (this.player.y > 500) {
        this.player.y = 500;
        this.player.vy = 0;
      }
      this.entities.player.pos = this.player;
    }
  }

  render(ctx) {
    super.render(ctx);
    // Draw player
    this.visuals.renderEntity(ctx, 'person', this.player.x, this.player.y, this.config.colors.player, 32);
  }
}
