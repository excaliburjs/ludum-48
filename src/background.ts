import config from "./config";
import { Level } from "level";
import { TileMap } from "excalibur";

export class Background {
  parallaxFactor = 0.25;
  top: TileMap;
  bottom: TileMap;

  constructor(level: Level) {
    this.top = new TileMap({
      x: 0,
      y: config.TileWidth * 5,
      rows: config.ChunkHeight,
      cols: config.ChunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });

    this.top.z = -1;

    this.bottom = new TileMap({
      x: 0,
      y: config.TileWidth * (5 + config.ChunkHeight),
      rows: config.ChunkHeight,
      cols: config.ChunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });
    this.bottom.z = -1;

    level.add(this.top);
    level.add(this.bottom);
  }
}
