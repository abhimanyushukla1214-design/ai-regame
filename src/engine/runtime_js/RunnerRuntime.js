class EndlessRunnerRuntime extends GameRuntime {
  constructor(config) {
    super(config);
    this.reset();
  }

  reset() {
    this.player = { x: 150, y: 400, vy: 0, width: 40, height: 40, grounded: true };
    this.gravity = this.config.physics.gravity || 0.8;
    this.jumpForce = this.config.physics.jump || -15;
    this.speed = this.config.physics.speed || 8;
    
    this.obstacles = [];
    this.collectibles = [];
    this.spawnTimer = 0;
    this.score = 0;
    this.distance = 0;
    this.state = 'PLAYING';
    
    this.groundY = 400;
  }

  spawnObstacle() {
    this.obstacles.push({
        x: this.config.world.width + 100,
        y: this.groundY - 40,
        w: 40,
        h: 40
    });
  }
  
  spawnCollectible() {
    this.collectibles.push({
        x: this.config.world.width + 100,
        y: this.groundY - 120 - Math.random() * 80,
        r: 15
    });
  }

  handleInput() {
    if (this.state !== 'PLAYING') return;
    
    // Jump
    if ((this.input.isDown('ArrowUp') || this.input.isDown('w') || this.input.isDown(' ')) && this.player.grounded) {
        this.player.vy = this.jumpForce;
        this.player.grounded = false;
        
        for(let i=0; i<8; i++) {
            this.particles.spawn(this.player.x, this.player.y + this.player.height, '#fff');
        }
    }
  }

  update(dt) {
    this.particles.update(dt);
    if (this.state === 'PLAYING') {
        this.handleInput();
        
        // Physics
        this.player.vy += this.gravity;
        this.player.y += this.player.vy;
        
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.grounded = true;
        }
        
        // Spawning
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            if (Math.random() < 0.7) {
                this.spawnObstacle();
            } else {
                this.spawnCollectible();
            }
            this.spawnTimer = Math.max(0.6, 1.5 - (this.speed * 0.05));
        }
        
        // Speed up over time
        this.speed += dt * 0.1;
        this.distance += this.speed * dt * 10;
        this.score = Math.floor(this.distance);
        
        // Update objects
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= this.speed;
            
            // Collision
            if (this.player.x < obs.x + obs.w &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.h &&
                this.player.y + this.player.height > obs.y) {
                this.state = 'END';
                for(let k=0; k<20; k++) this.particles.spawn(this.player.x, this.player.y, '#ef4444');
            }
            
            if (obs.x < -100) this.obstacles.splice(i, 1);
        }
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            let c = this.collectibles[i];
            c.x -= this.speed;
            
            // Collision
            let dx = (this.player.x + this.player.width/2) - c.x;
            let dy = (this.player.y + this.player.height/2) - c.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.player.width/2 + c.r) {
                this.score += 500;
                this.distance += 500;
                this.collectibles.splice(i, 1);
                for(let k=0; k<10; k++) this.particles.spawn(c.x, c.y, this.config.colors.collectible || '#fde047');
                continue;
            }
            
            if (c.x < -100) this.collectibles.splice(i, 1);
        }
    }
  }

  render(ctx) {
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;
    
    // Background
    ctx.fillStyle = this.config.colors.bg || '#0f172a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw ground
    ctx.fillStyle = this.config.colors.platform || '#475569';
    ctx.fillRect(0, this.groundY, ctx.canvas.width, ctx.canvas.height - this.groundY);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, this.groundY, ctx.canvas.width, 6);
    
    // Parallax background details
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i=0; i<5; i++) {
        let px = ((this.distance * -0.2) + (i * 300)) % (ctx.canvas.width + 300);
        if (px < -300) px += ctx.canvas.width + 300;
        ctx.fillRect(px, this.groundY - 100, 100, 100);
    }
    
    this.particles.render(ctx);
    
    // Draw Obstacles
    for (let obs of this.obstacles) {
        this.visuals.renderEntity(ctx, 'enemy', obs.x + obs.w/2, obs.y + obs.h/2, this.config.colors.enemy || '#ef4444', obs.w);
    }
    
    // Draw Collectibles
    for (let c of this.collectibles) {
        ctx.fillStyle = this.config.colors.collectible || '#fde047';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw Player
    if (this.state !== 'END') {
        this.visuals.renderEntity(ctx, 'player', this.player.x + this.player.width/2, this.player.y + this.player.height/2, this.config.colors.player || '#38bdf8', this.player.width);
    }
  }
}
