import config from "./config";
import { Level } from "level";
import { TileMap } from "excalibur";
import { Resources } from "./resources";

export class Background {
  parallaxFactor = 0.25;
  top!: TileMap;
  bottom!: TileMap;

  useTop = true;

  constructor(level: Level) {
    const backgroundSprite = Resources.DirtBackground.toSprite();
    this.top = new TileMap({
      x: 0,
      y: config.TileWidth * 5,
      rows: config.ChunkHeight,
      cols: config.ChunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });
    this.top.z = -1;
    this.top.data.forEach((c) => {
      c.addSprite(backgroundSprite);
    });

    this.bottom = new TileMap({
      x: 0,
      y: config.TileWidth * (5 + config.ChunkHeight),
      rows: config.ChunkHeight,
      cols: config.ChunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });
    this.bottom.z = -1;
    this.bottom.data.forEach((c) => {
      c.addSprite(backgroundSprite);
    });

    level.add(this.top);
    level.add(this.bottom);
  }

  setCurrentChunkId(id: number) {
    const startOffset = config.TileWidth * 5;
    if (id > 0) {
      this.top.y =
        (id - 1) * (config.TileWidth * config.ChunkHeight) + startOffset;
      this.bottom.y =
        id * (config.TileWidth * config.ChunkHeight) + startOffset;
    }
  }
}
