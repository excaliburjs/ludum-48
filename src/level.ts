import { Axis, Engine, Scene, TileMap, vec } from "excalibur";
import { Resources } from "./resources";
import { Player } from "./player";
import config from "./config";

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen
  onInitialize(engine: Engine) {
    const player = new Player(this);
    this.add(player);

    // Camera follows actor's Y Axis
    this.camera.strategy.lockToActorAxis(player, Axis.Y);

    const tileMap = this.generateChunk(config.TileWidth * this.start);
    const tileMap2 = this.generateChunk(
      config.TileWidth * (this.chunkHeight + this.start)
    );

    this.add(tileMap);
    this.add(tileMap2);
  }

  generateChunk(yPos: number): TileMap {
    const tileSprite = Resources.Dirt.toSprite();
    const tileMap = new TileMap({
      x: 0, // always the left
      y: yPos,
      rows: this.chunkHeight,
      cols: this.chunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });

    for (let cell of tileMap.data) {
      cell.addSprite(tileSprite);
    }

    return tileMap;
  }
}
