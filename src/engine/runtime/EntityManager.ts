import { Entity } from './Entity.js';

export class EntityManager {
  entities: Entity[] = [];

  add(entity: Entity) {
    this.entities.push(entity);
  }

  update(dt: number) {
    for (const entity of this.entities) {
      entity.update(dt, this.entities);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const entity of this.entities) {
      entity.render(ctx);
    }
  }

  clear() {
    this.entities = [];
  }
}
