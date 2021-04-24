import { Engine, Scene, TileMap, vec } from "excalibur";
import { Resources } from "./resources";

export class Level extends Scene {
  start = 5; // tiles down
  chunkHeight = 16; // full screen
  onInitialize(engine: Engine) {
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
      cols: 9, // try 5 then 7 or 9?
      cellWidth: 64,
      cellHeight: 64,
    });

    for (let cell of tileMap.data) {
      cell.addSprite(tileSprite);
    }

    return tileMap;
  }
}
