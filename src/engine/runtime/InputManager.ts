export class InputManager {
  keys: Record<string, boolean> = {};

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.keys[e.key] = true;
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.keys[e.key] = false;
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  isDown(key: string): boolean {
    return !!this.keys[key] || !!this.keys[key.toLowerCase()];
  }
}
