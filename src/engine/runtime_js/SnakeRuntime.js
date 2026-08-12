class SnakeRuntime extends GameRuntime {
  constructor(config) {
    super(config);
    this.gridSize = 25;
    this.reset();
  }

  reset() {
    this.cols = Math.floor(this.config.world.width / this.gridSize);
    this.rows = Math.floor(this.config.world.height / this.gridSize);
    const cx = Math.floor(this.cols / 2);
    const cy = Math.floor(this.rows / 2);
    this.snake = [
        {x: cx, y: cy},
        {x: cx - 1, y: cy},
        {x: cx - 2, y: cy}
    ];
    this.direction = {x: 1, y: 0};
    this.nextDirection = {x: 1, y: 0};
    this.food = {x: 5, y: 5};
    this.moveTimer = 0;
    this.moveInterval = 0.15;
    this.score = 0;
    this.state = 'PLAYING';
    this.spawnFood();
  }

  spawnFood() {
    let attempts = 0;
    while (attempts < 100) {
        const fx = Math.floor(Math.random() * (this.cols - 2)) + 1;
        const fy = Math.floor(Math.random() * (this.rows - 2)) + 1;
        
        let onSnake = false;
        for (let segment of this.snake) {
            if (segment.x === fx && segment.y === fy) {
                onSnake = true;
                break;
            }
        }
        if (!onSnake) {
            this.food = {x: fx, y: fy};
            return;
        }
        attempts++;
    }
  }

  handleInput() {
    if (this.state !== 'PLAYING') return;
    if (this.input.isDown('ArrowUp') || this.input.isDown('w')) if (this.direction.y !== 1) this.nextDirection = {x: 0, y: -1};
    else if (this.input.isDown('ArrowDown') || this.input.isDown('s')) if (this.direction.y !== -1) this.nextDirection = {x: 0, y: 1};
    else if (this.input.isDown('ArrowLeft') || this.input.isDown('a')) if (this.direction.x !== 1) this.nextDirection = {x: -1, y: 0};
    else if (this.input.isDown('ArrowRight') || this.input.isDown('d')) if (this.direction.x !== -1) this.nextDirection = {x: 1, y: 0};
  }

  update(dt) {
    this.particles.update(dt);
    if (this.state === 'PLAYING') {
      this.handleInput();
      this.moveTimer += dt;
      if (this.moveTimer >= this.moveInterval) {
        this.moveTimer = 0;
        this.updateSnake();
      }
    }
  }

  updateSnake() {
    this.direction = {...this.nextDirection};
    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
    
    // Boundary collision
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this.state = 'END';
      return;
    }
    
    // Self collision
    for (let i = 1; i < this.snake.length; i++) {
        if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
            this.state = 'END';
            return;
        }
    }

    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 100;
      this.spawnFood();
    } else {
      this.snake.pop();
    }
  }

  render(ctx) {
    super.render(ctx);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * this.gridSize, 0);
        ctx.lineTo(i * this.gridSize, this.rows * this.gridSize);
        ctx.stroke();
    }
    for (let i = 0; i <= this.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * this.gridSize);
        ctx.lineTo(this.cols * this.gridSize, i * this.gridSize);
        ctx.stroke();
    }

    ctx.fillStyle = this.config.colors.player;
    for (let part of this.snake) {
      const pos = this.gridToScreen(part.x, part.y, this.gridSize);
      ctx.fillRect(pos.x + 2, pos.y + 2, this.gridSize - 4, this.gridSize - 4);
    }
    
    ctx.fillStyle = this.config.colors.enemy;
    const foodPos = this.gridToScreen(this.food.x, this.food.y, this.gridSize);
    ctx.beginPath();
    ctx.arc(foodPos.x + this.gridSize/2, foodPos.y + this.gridSize/2, this.gridSize/2 - 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
