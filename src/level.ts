import { Engine, Scene, TileMap, vec } from "excalibur";
import { Resources } from "./resources";

export class Level extends Scene {
  onInitialize(engine: Engine) {
    const tileMap = this.generateChunk(64 * 5);

    this.add(tileMap);
  }

  generateChunk(yPos: number): TileMap {
    const tileSprite = Resources.Dirt.toSprite();
    const tileMap = new TileMap({
      x: 0,
      y: yPos,
      rows: 10,
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
