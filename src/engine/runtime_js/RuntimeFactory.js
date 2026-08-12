class RuntimeFactory {
  static createRuntime(config) {
    const archetype = config.archetype;
    switch (archetype) {
      case 'SNAKE':
        return new SnakeRuntime(config);
      case 'PLATFORMER':
        return new PlatformerRuntime(config);
      default:
        return new GameRuntime(config);
    }
  }
}
