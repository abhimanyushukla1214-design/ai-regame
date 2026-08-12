class TopDownShooterRuntime extends GameRuntime {
  constructor(config) {
    super(config);
    this.reset();
  }

  reset() {
    this.player = { x: 400, y: 300, vx: 0, vy: 0, speed: 5, radius: 15 };
    this.projectiles = [];
    this.enemies = [];
    this.shootTimer = 0;
    this.enemySpawnTimer = 0;
    this.score = 0;
    this.hp = 100;
    this.state = 'PLAYING';
    
    // Spawn initial enemies
    for (let i = 0; i < 3; i++) this.spawnEnemy();
  }

  spawnEnemy() {
    // Spawn enemy at edge of screen
    let ex, ey;
    if (Math.random() < 0.5) {
        ex = Math.random() < 0.5 ? -30 : this.config.world.width + 30;
        ey = Math.random() * this.config.world.height;
    } else {
        ex = Math.random() * this.config.world.width;
        ey = Math.random() < 0.5 ? -30 : this.config.world.height + 30;
    }
    this.enemies.push({ x: ex, y: ey, radius: 15, speed: 2, hp: 20 });
  }

  handleInput() {
    if (this.state !== 'PLAYING') return;
    
    this.player.vx = 0;
    this.player.vy = 0;
    
    if (this.input.isDown('ArrowLeft') || this.input.isDown('a')) this.player.vx = -this.player.speed;
    if (this.input.isDown('ArrowRight') || this.input.isDown('d')) this.player.vx = this.player.speed;
    if (this.input.isDown('ArrowUp') || this.input.isDown('w')) this.player.vy = -this.player.speed;
    if (this.input.isDown('ArrowDown') || this.input.isDown('s')) this.player.vy = this.player.speed;
    
    // Normalize diagonal speed
    if (this.player.vx !== 0 && this.player.vy !== 0) {
        const length = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
        this.player.vx = (this.player.vx / length) * this.player.speed;
        this.player.vy = (this.player.vy / length) * this.player.speed;
    }
    
    if (this.input.isDown(' ') && this.shootTimer <= 0) {
        this.shoot();
        this.shootTimer = 0.15; // Fire rate
    }
  }

  shoot() {
    // Determine shoot direction based on last movement, default to UP
    let dirX = 0, dirY = -1;
    if (this.player.vx !== 0 || this.player.vy !== 0) {
        dirX = this.player.vx > 0 ? 1 : (this.player.vx < 0 ? -1 : 0);
        dirY = this.player.vy > 0 ? 1 : (this.player.vy < 0 ? -1 : 0);
        // Normalize
        const len = Math.sqrt(dirX*dirX + dirY*dirY);
        dirX /= len;
        dirY /= len;
    }
    
    this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: dirX * 12,
        vy: dirY * 12,
        radius: 4,
        life: 2.0 // Seconds to live
    });
  }

  update(dt) {
    this.particles.update(dt);
    if (this.state === 'PLAYING') {
        this.handleInput();
        
        if (this.shootTimer > 0) this.shootTimer -= dt;
        
        this.enemySpawnTimer -= dt;
        if (this.enemySpawnTimer <= 0) {
            this.spawnEnemy();
            this.enemySpawnTimer = Math.max(0.5, 2.0 - (this.score / 1000));
        }

        // Update player
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // Clamp to screen
        this.player.x = Math.max(this.player.radius, Math.min(this.config.world.width - this.player.radius, this.player.x));
        this.player.y = Math.max(this.player.radius, Math.min(this.config.world.height - this.player.radius, this.player.y));

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
            if (p.life <= 0) this.projectiles.splice(i, 1);
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            // Move towards player
            let dx = this.player.x - e.x;
            let dy = this.player.y - e.y;
            let len = Math.sqrt(dx*dx + dy*dy);
            if (len > 0) {
                e.x += (dx / len) * e.speed;
                e.y += (dy / len) * e.speed;
            }
            
            // Player collision
            if (len < this.player.radius + e.radius) {
                this.hp -= 20;
                this.enemies.splice(i, 1);
                for(let k=0; k<10; k++) this.particles.spawn(this.player.x, this.player.y, '#ef4444');
                if (this.hp <= 0) this.state = 'END';
                continue;
            }
            
            // Projectile collision
            for (let j = this.projectiles.length - 1; j >= 0; j--) {
                let p = this.projectiles[j];
                let pdx = p.x - e.x;
                let pdy = p.y - e.y;
                if (Math.sqrt(pdx*pdx + pdy*pdy) < e.radius + p.radius) {
                    // Hit
                    e.hp -= 10;
                    this.projectiles.splice(j, 1);
                    for(let k=0; k<5; k++) this.particles.spawn(e.x, e.y, '#fde047');
                    
                    if (e.hp <= 0) {
                        this.score += 100;
                        this.enemies.splice(i, 1);
                        for(let k=0; k<15; k++) this.particles.spawn(e.x, e.y, this.config.colors.enemy);
                        break;
                    }
                }
            }
        }
    }
  }

  render(ctx) {
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;
    
    // Background
    ctx.fillStyle = this.config.colors.bg || '#0f172a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Grid lines for perspective
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < ctx.canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ctx.canvas.height); ctx.stroke();
    }
    for (let y = 0; y < ctx.canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width, y); ctx.stroke();
    }
    
    this.particles.render(ctx);
    
    // Draw Projectiles
    ctx.fillStyle = '#fde047';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fde047';
    for (let p of this.projectiles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Draw Enemies
    for (let e of this.enemies) {
        this.visuals.renderEntity(ctx, 'enemy', e.x, e.y, this.config.colors.enemy || '#ef4444', e.radius * 2);
    }
    
    // Draw Player
    this.visuals.renderEntity(ctx, 'player', this.player.x, this.player.y, this.config.colors.player || '#38bdf8', this.player.radius * 2);
    
    // Draw crosshair indicator towards mouse (or just facing direction)
    let aimX = this.player.x;
    let aimY = this.player.y;
    if (this.player.vx !== 0 || this.player.vy !== 0) {
        aimX += this.player.vx * 10;
        aimY += this.player.vy * 10;
    } else {
        aimY -= 10; // Default UP
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(aimX, aimY); ctx.stroke();
  }
}
