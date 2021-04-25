import config from "./config";
import { Level } from "level";
import { TileMap } from "excalibur";
import { Resources } from "./resources";

export class Background {
  parallaxFactor = 0.25;
  backgrounds: TileMap[] = [];
  lastChunkId = 0;
  useTop = true;

  constructor(level: Level) {
    const backgroundSprite = Resources.DirtBackground.toSprite();
    const top = new TileMap({
      x: 0,
      y: config.TileWidth * 5,
      rows: config.ChunkHeight,
      cols: config.ChunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });
    top.z = -1;
    top.data.forEach((c) => {
      c.addSprite(backgroundSprite);
    });

    const bottom = new TileMap({
      x: 0,
      y: config.TileWidth * (5 + config.ChunkHeight),
      rows: config.ChunkHeight,
      cols: config.ChunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });
    bottom.z = -1;
    bottom.data.forEach((c) => {
      c.addSprite(backgroundSprite);
    });

    level.add(top);
    level.add(bottom);

    this.backgrounds = [top, bottom];
  }

  setCurrentChunkId(id: number) {
    const startOffset = config.TileWidth * 5;
    if (id < 0) {
      return;
    }

    if (id % 2 === 0) {
      const first = this.backgrounds[0];
      first.y = id * (config.TileWidth * config.ChunkHeight) + startOffset;
    } else {
      const second = this.backgrounds[1];
      second.y = id * (config.TileWidth * config.ChunkHeight) + startOffset;
    }

    this.lastChunkId = id;
  }
}
