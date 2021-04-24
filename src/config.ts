export default {
  RandomSeed: 1337,

  // Board Layout
  TileWidth: 64, // pixels

  ChunkWidth: 9, // tiles
  ChunkHeight: 16, // tiles

  AspectRatio: 9 / 16, // 9:16
  InvAspectRatio: 1 / (9 / 16),

  DigTime: 400,
  SpaceMoveDuration: 500,

  RockDigDelay: 100,

  /**************************
   * Snek Config
   **************************/
  SnekAdvanceTimer: 5, // seconds per tile
  SnekAcceleration: 0.05, // seconds per tile when user is further away
  SnekCatchUpAcceleration: 2,
  SnekDistanceBeforeCatchUp: 10,
  SnekMaxSpeed: 1,
  SnekBodyLength: 7, // head is 1 tile, this is the rest
};
