export default {
  TerrainRandomSeed: 1337,
  CollectibleRandomSeed: 7331,

  // Progress meter
  DistanceToComplete: 200,
  MeterTilesHigh: 20,

  // Board Layout
  TileWidth: 64, // pixels

  ChunkWidth: 9, // tiles
  ChunkHeight: 16, // tiles

  AspectRatio: 9 / 16, // 9:16
  InvAspectRatio: 1 / (9 / 16),

  DigTime: 200,
  SpaceMoveDuration: 200,
  PowerUpSpeedIncreaseFactor: 2,
  PowerUpDurationSeconds: 2,

  RockDigDelay: 100,

  /**************************
   * Snek Config
   **************************/
  SnekStartingSecondsPerSquare: 5, // seconds per tile
  SnekAcceleration: 0.05, // seconds per tile when user is further away
  SnekCatchUpSecondsPerSquare: 0.5,
  SnekSquaresDistanceBeforeCatchUpSpeed: 10,
  SnekMinSecondsPerSquare: 250 / 1000,
  SnekBodyLength: 7, // head is 1 tile, this is the rest
  SnakeMoveDuration: 100,
};
