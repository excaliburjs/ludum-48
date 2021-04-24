import { Axis, Cell, Engine, Scene, TileMap, vec } from "excalibur";
import { Resources } from "./resources";
import { Player } from "./player";
import config from "./config";

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  onScreenChunk: TileMap | null = null;
  nextChunk: TileMap | null = null;

  player: Player | null = null;

  onInitialize(engine: Engine) {
    this.player = new Player(this);
    this.add(this.player);

    // Camera follows actor's Y Axis
    this.camera.strategy.lockToActorAxis(this.player, Axis.Y);

    const tileMap = this.generateChunk(config.TileWidth * this.start);

    this.previousChunk = null;
    this.nextChunk = null;
    this.add((this.onScreenChunk = tileMap));
  }

  onPostUpdate() {
    if (this.onScreenChunk && this.player) {
      if (
        this.player.pos.y >
        this.onScreenChunk.y + (config.TileWidth * config.ChunkHeight) / 2
      ) {
        this.loadNextChunk();
      }

      // if ((this.player.pos.y - config.TileWidth)  < (this.onScreenChunk.y + (config.TileWidth * config.ChunkHeight) / 2)) {
      //     this.loadPrevChunk();
      // }
    }
  }

  getTile(xpos: number, ypos: number): Cell | null {
    return (
      this.onScreenChunk?.getCellByPoint(xpos, ypos) ??
      this.previousChunk?.getCellByPoint(xpos, ypos) ??
      null
    );
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

  loadNextChunk(): void {
    this.onScreenChunkId++;
    console.log("Loading chunk id: ", this.onScreenChunkId);
    // TODO level generation logic in generate chunk
    const newChunk = this.generateChunk(
      this.onScreenChunkId * (config.TileWidth * config.ChunkHeight) +
        this.start * config.TileWidth
    );
    if (this.previousChunk) {
      this.remove(this.previousChunk);
      console.log("Removing previous chunk");
    }
    this.previousChunk = this.onScreenChunk;
    this.onScreenChunk = newChunk;
    this.add(this.onScreenChunk);
  }

  loadPrevChunk(): void {
    if (this.onScreenChunkId > 0) {
      this.onScreenChunkId--;
      console.log("Loading chunk id: ", this.onScreenChunkId);
      const newChunk = this.generateChunk(
        this.onScreenChunkId * (config.TileWidth * config.ChunkHeight) +
          this.start * config.TileWidth
      );

      if (this.previousChunk) {
        this.remove(this.previousChunk);
      }

      this.previousChunk = this.onScreenChunk;
      this.onScreenChunk = newChunk;
      this.add(this.onScreenChunk);
    }
  }
}
