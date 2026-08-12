export interface GameRecord {
  id: string;
  title: string;
  developer: string;
  releaseYear: number;
  platforms: string[];
  genres: string[];
  themes: string[];
  mechanics: string[];
  description: string;
}

export const GAME_DATABASE: GameRecord[] = [
  {
    id: "g1",
    title: "Subnautica",
    developer: "Unknown Worlds Entertainment",
    releaseYear: 2018,
    platforms: ["PC", "PS4", "Xbox One", "Switch"],
    genres: ["Survival", "Adventure", "Exploration"],
    themes: ["Ocean", "Alien Planet", "Isolation", "Sci-Fi"],
    mechanics: ["Resource Gathering", "Base Building", "Crafting", "Underwater Swimming", "Vehicle Management"],
    description: "Descend into the depths of an alien underwater world filled with wonder and peril. Craft equipment, pilot submarines and out-smart wildlife to explore lush coral reefs, volcanoes, cave systems, and more - all while trying to survive."
  },
  {
    id: "g2",
    title: "Outer Wilds",
    developer: "Mobius Digital",
    releaseYear: 2019,
    platforms: ["PC", "PS4", "Xbox One", "Switch"],
    genres: ["Adventure", "Exploration", "Puzzle"],
    themes: ["Space", "Time Loop", "Mystery", "Sci-Fi", "Cosmic"],
    mechanics: ["Space Flight", "Time Loop", "Investigation", "Zero Gravity", "Translating Languages"],
    description: "Outer Wilds is an open world mystery about a solar system trapped in an endless time loop."
  },
  {
    id: "g3",
    title: "Hollow Knight",
    developer: "Team Cherry",
    releaseYear: 2017,
    platforms: ["PC", "Switch", "PS4", "Xbox One"],
    genres: ["Metroidvania", "Action", "Platformer"],
    themes: ["Dark Fantasy", "Bugs", "Ruins", "Mystery", "Atmospheric"],
    mechanics: ["2D Platforming", "Melee Combat", "Exploration", "Upgrades", "Boss Fights"],
    description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style."
  },
  {
    id: "g4",
    title: "Dead Space",
    developer: "EA Redwood Shores",
    releaseYear: 2008,
    platforms: ["PC", "PS3", "Xbox 360"],
    genres: ["Survival Horror", "Action", "Shooter"],
    themes: ["Sci-Fi", "Horror", "Space Station", "Gore", "Isolation"],
    mechanics: ["Third-Person Shooting", "Dismemberment", "Zero Gravity", "Resource Management", "Upgrades"],
    description: "A massive deep-space mining ship goes dark after unearthing a strange artifact on a distant planet. Engineer Isaac Clarke embarks on the repair mission, only to uncover a nightmarish bloodbath."
  },
  {
    id: "g5",
    title: "Stardew Valley",
    developer: "ConcernedApe",
    releaseYear: 2016,
    platforms: ["PC", "PS4", "Xbox One", "Switch", "Mobile"],
    genres: ["Simulation", "RPG"],
    themes: ["Farming", "Cozy", "Life Sim", "Nature", "Community"],
    mechanics: ["Farming", "Crafting", "Socializing", "Mining", "Fishing"],
    description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life."
  },
  {
    id: "g6",
    title: "Celeste",
    developer: "Maddy Makes Games",
    releaseYear: 2018,
    platforms: ["PC", "Switch", "PS4", "Xbox One"],
    genres: ["Platformer", "Indie"],
    themes: ["Mountain", "Mental Health", "Personal Growth", "Challenge"],
    mechanics: ["Precision Platforming", "Dashing", "Wall Climbing", "Collectibles"],
    description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight platformer from the creators of TowerFall."
  },
  {
    id: "g7",
    title: "SOMA",
    developer: "Frictional Games",
    releaseYear: 2015,
    platforms: ["PC", "PS4", "Xbox One"],
    genres: ["Survival Horror", "Adventure"],
    themes: ["Sci-Fi", "Ocean", "Existentialism", "AI", "Isolation"],
    mechanics: ["Stealth", "Puzzle Solving", "Exploration", "Narrative Choices"],
    description: "SOMA is a sci-fi horror game from Frictional Games, the creators of Amnesia: The Dark Descent. It is an unsettling story about identity, consciousness, and what it means to be human."
  },
  {
    id: "g8",
    title: "No Man's Sky",
    developer: "Hello Games",
    releaseYear: 2016,
    platforms: ["PC", "PS4", "Xbox One", "Switch"],
    genres: ["Survival", "Adventure", "Action"],
    themes: ["Space", "Sci-Fi", "Procedural Generation", "Exploration"],
    mechanics: ["Space Flight", "Resource Gathering", "Crafting", "Base Building", "Seamless Planetary Landing"],
    description: "Inspired by the adventure and imagination that we love from classic science-fiction, No Man's Sky presents you with a galaxy to explore, filled with unique planets and lifeforms, and constant danger and action."
  },
  {
    id: "g9",
    title: "Return of the Obra Dinn",
    developer: "Lucas Pope",
    releaseYear: 2018,
    platforms: ["PC", "Switch", "PS4", "Xbox One"],
    genres: ["Puzzle", "Adventure"],
    themes: ["Mystery", "Nautical", "Historical", "Supernatural"],
    mechanics: ["Investigation", "Time Travel", "Deduction", "Logic Puzzle"],
    description: "In 1802, the merchant ship Obra Dinn set out from London for the Orient with over 200 tons of trade goods. Six months later it hadn't met its rendezvous point at the Cape of Good Hope and was declared lost at sea."
  },
  {
    id: "g10",
    title: "Disco Elysium",
    developer: "ZA/UM",
    releaseYear: 2019,
    platforms: ["PC", "PS4", "PS5", "Xbox", "Switch"],
    genres: ["RPG", "Adventure"],
    themes: ["Detective", "Political", "Psychological", "Noir", "Urban"],
    mechanics: ["Dialogue Trees", "Skill Checks", "Investigation", "No Combat"],
    description: "Disco Elysium is a groundbreaking role playing game. You're a detective with a unique skill system at your disposal and a whole city block to carve your path across. Interrogate unforgettable characters, crack murders or take bribes."
  }
];
