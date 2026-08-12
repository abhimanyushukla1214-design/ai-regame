class RuntimeFactory {
  static createRuntime(config) {
    const archetype = config.archetype;
    switch (archetype) {
      case 'SNAKE':
        return new SnakeRuntime(config);
      case 'PLATFORMER':
        return new PlatformerRuntime(config);
      case 'TOP_DOWN_SHOOTER':
      case 'SHOOTER':
        return new TopDownShooterRuntime(config);
      case 'ENDLESS_RUNNER':
      case 'RUNNER':
        return new EndlessRunnerRuntime(config);
      default:
        // Use Platformer as a more exciting fallback than an empty generic runtime
        return new PlatformerRuntime(config);
    }
  }
}
