import { InputManager } from './InputManager.js';
import { EntityManager } from './EntityManager.js';
import { CameraSystem } from './CameraSystem.js';
import { Entity } from './Entity.js';

export class GameRuntime {
  state: 'INTRO' | 'PLAYING' | 'PAUSED' | 'END' = 'INTRO';
  input: InputManager;
  entityManager: EntityManager;
  camera: CameraSystem;
  lastTime: number = 0;

  constructor(public config: any) {
    this.input = new InputManager();
    this.entityManager = new EntityManager();
    this.camera = new CameraSystem(config.world.width, config.world.height);
  }

  update(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.08);
    this.lastTime = time;

    if (this.state === 'PLAYING') {
      this.entityManager.update(dt);
      // Here you would find the player entity and update camera
      // For now, assume a player is added
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (this.state === 'PLAYING') {
      this.camera.apply(ctx);
      this.entityManager.render(ctx);
      this.camera.reset(ctx);
    }
  }
}
