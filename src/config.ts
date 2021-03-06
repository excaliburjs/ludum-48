export default {
  DebugMenuEnabled: false,
  TerrainRandomSeed: Math.floor(10000 * Math.random()), //1337,
  CollectibleRandomSeed: Math.floor(10000 * Math.random()), //7331,

  BackgroundVolume: 0.3,
  SoundVolume: 0.3,
  PickupSoundVolume: 0.1,
  DigSoundVolume: 0.1,
  ChuchuVolume: 0.1,

  // Progress meter
  DistanceToComplete: 210,
  DistanceToRound: 70,
  MeterTilesHigh: 20,

  // Board Layout
  TileWidth: 64, // pixels

  ChunkWidth: 9, // tiles
  ChunkHeight: 16, // tiles

  AspectRatio: 9 / 16, // 9:16
  InvAspectRatio: 1 / (9 / 16),

  DigTime: 200,
  SpaceMoveDuration: 200,
  BeetleSpaceMoveDuration: 1000,
  PowerUpSpeedIncreaseFactor: 2,
  PowerUpDurationSeconds: 2,

  RockDigDelay: 100,

  SnekSlowDownByAfterConcert: 75,

  SnekStartingSpeed: 800,
  SnekFastestSpeed: 200,
  SnekFastestSpeedDistance: 15,

  SnekFasterSpeed: 350,
  SnekFasterSpeedDistance: 8,

  SnekSlowDownBy: 25,
  SnekSlowDownDistance: 4,

  SnekStraitPathBoost: 30,
  SnekStraitDownCount: 5,
  SnekStraitPathBoostCooldown: 5,

  /**************************
   * Snek Config
   **************************/
  //   SnekStartingSecondsPerSquare: 5, // seconds per tile
  //   SnekAcceleration: 0.05, // seconds per tile when user is further away
  //   SnekCatchUpSecondsPerSquare: 0.5,
  //   SnekSquaresDistanceBeforeCatchUpSpeed: 10,
  //   SnekMinSecondsPerSquare: 250 / 1000,
  SnekBodyLength: 7, // head is 1 tile, this is the rest
  SnakeMoveDuration: 100,
  SnakeAnimationFrameDuration: 100,
};
