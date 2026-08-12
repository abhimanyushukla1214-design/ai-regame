class PlatformerRuntime extends GameRuntime {
  constructor(config) {
    super(config);
    this.reset();
  }

  reset() {
    this.player = { x: 100, y: 100, vx: 0, vy: 0, width: 32, height: 32, grounded: false };
    this.gravity = this.config.physics.gravity || 0.6;
    this.jumpForce = this.config.physics.jump || -12;
    this.speed = this.config.physics.speed || 5;
    this.state = 'PLAYING';
    
    this.platforms = [
        { x: 0, y: 500, w: 2000, h: 100 }, // Floor
        { x: 300, y: 400, w: 150, h: 20 },
        { x: 550, y: 300, w: 150, h: 20 },
        { x: 800, y: 200, w: 150, h: 20 },
        { x: 1050, y: 350, w: 200, h: 20 },
    ];
    
    this.collectibles = [
        { x: 375, y: 350, w: 20, h: 20, active: true },
        { x: 625, y: 250, w: 20, h: 20, active: true },
        { x: 875, y: 150, w: 20, h: 20, active: true },
        { x: 1150, y: 300, w: 20, h: 20, active: true }
    ];

    this.entities.player = {type: 'person', pos: this.player};
    this.camera = { x: 0, y: 0 };
    this.score = 0;
  }

  handleInput() {
    if (this.state !== 'PLAYING') return;
    
    if (this.input.isDown('ArrowLeft') || this.input.isDown('a')) this.player.vx = -this.speed;
    else if (this.input.isDown('ArrowRight') || this.input.isDown('d')) this.player.vx = this.speed;
    else this.player.vx = 0;
    
    if ((this.input.isDown('ArrowUp') || this.input.isDown('w') || this.input.isDown(' ')) && this.player.grounded) {
        this.player.vy = this.jumpForce;
        this.player.grounded = false;
        // spawn jump particles
        for(let i=0; i<5; i++) {
           this.particles.spawn(this.player.x, this.player.y + this.player.height, '#fff');
        }
    }
  }

  update(dt) {
    this.particles.update(dt);
    if (this.state === 'PLAYING') {
      this.handleInput();
      
      this.player.vy += this.gravity;
      
      let nextX = this.player.x + this.player.vx;
      let nextY = this.player.y + this.player.vy;
      this.player.grounded = false;

      // Collision detection with platforms
      for (let p of this.platforms) {
          // AABB collision
          if (nextX + this.player.width/2 > p.x && nextX - this.player.width/2 < p.x + p.w &&
              this.player.y + this.player.height > p.y && this.player.y < p.y + p.h) {
              // Colliding horizontally
              nextX = this.player.x; 
              this.player.vx = 0;
          }
          if (this.player.x + this.player.width/2 > p.x && this.player.x - this.player.width/2 < p.x + p.w &&
              nextY + this.player.height > p.y && nextY < p.y + p.h) {
              // Colliding vertically
              if (this.player.vy > 0) {
                  // Falling down
                  nextY = p.y - this.player.height;
                  this.player.grounded = true;
              } else if (this.player.vy < 0) {
                  // Hitting head
                  nextY = p.y + p.h;
              }
              this.player.vy = 0;
          }
      }
      
      this.player.x = nextX;
      this.player.y = nextY;
      
      // Screen bounds
      if (this.player.x < this.player.width/2) this.player.x = this.player.width/2;
      
      // Collectibles
      for (let c of this.collectibles) {
          if (c.active && 
              Math.abs(this.player.x - c.x) < 30 && 
              Math.abs(this.player.y - c.y) < 30) {
              c.active = false;
              this.score += 50;
              for(let i=0; i<10; i++) {
                  this.particles.spawn(c.x, c.y, this.config.colors.collectible);
              }
          }
      }
      
      // Camera follow
      if (this.ctx) {
         const targetCamX = this.player.x - this.ctx.canvas.width / 3;
         this.camera.x += (targetCamX - this.camera.x) * 0.1;
         // Prevent going out of bounds
         if (this.camera.x < 0) this.camera.x = 0;
      }
      
      // Death pit
      if (this.player.y > 800) {
         this.state = 'END';
         this.hp = 0;
      }

      this.entities.player.pos = this.player;
    }
  }

  render(ctx) {
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;
    
    // Fill background
    ctx.fillStyle = this.config.colors.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    
    this.particles.render(ctx);
    
    // Draw platforms
    ctx.fillStyle = this.config.colors.platform || '#475569';
    for (let p of this.platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        
        // Grass top
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x, p.y, p.w, 5);
        ctx.fillStyle = this.config.colors.platform || '#475569';
    }
    
    // Draw Collectibles
    ctx.fillStyle = this.config.colors.collectible || '#fde047';
    for (let c of this.collectibles) {
        if (c.active) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.w/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw player
    this.visuals.renderEntity(ctx, 'person', this.player.x, this.player.y, this.config.colors.player, this.player.width);
    
    ctx.restore();
  }
}
