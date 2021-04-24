import { Axis, Engine, Scene, TileMap, vec } from "excalibur";
import { Resources } from "./resources";
import { Player } from "./player";

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = 9;
  chunkHeight = 16; // full screen
  onInitialize(engine: Engine) {
    const player = new Player(this);
    this.add(player);

    // Camera follows actor's Y Axis
    this.camera.strategy.lockToActorAxis(player, Axis.Y);

    const tileMap = this.generateChunk(64 * this.start);
    const tileMap2 = this.generateChunk(64 * (this.chunkHeight + this.start));

    this.add(tileMap);
    this.add(tileMap2);
  }

  generateChunk(yPos: number): TileMap {
    const tileSprite = Resources.Dirt.toSprite();
    const tileMap = new TileMap({
      x: 0,
      y: yPos,
      rows: this.chunkHeight,
      cols: this.chunkWidth, // try 5 then 7 or 9?
      cellWidth: 64,
      cellHeight: 64,
    });

    for (let cell of tileMap.data) {
      cell.addSprite(tileSprite);
    }

    return tileMap;
  }
}
