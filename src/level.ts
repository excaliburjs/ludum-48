import { Axis, Cell, Engine, Scene, TileMap, vec } from "excalibur";
import { Resources } from "./resources";
import { Player } from "./player";
import config from "./config";
import { Snek } from "./snek";

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  currentChunk: TileMap | null = null;

  player: Player | null = null;
  snek: Snek | null = null;

  onInitialize(engine: Engine) {
    this.player = new Player(this);
    this.snek = new Snek(this);

    this.add(this.player);
    this.add(this.snek);

    // Camera follows actor's Y Axis
    this.camera.strategy.lockToActorAxis(this.player, Axis.Y);

    const tileMap = this.generateChunk(config.TileWidth * this.start);

    this.previousChunk = null;
    this.add((this.currentChunk = tileMap));
  }

  onPostUpdate() {
    if (this.currentChunk && this.player) {
      if (
        this.player.pos.y >
        this.currentChunk.y + (config.TileWidth * config.ChunkHeight) / 2
      ) {
        this.loadNextChunk();
      }
    }

    if (this.previousChunk && this.player) {
      if (
        this.player.pos.y <=
        this.previousChunk.y + (config.TileWidth * config.ChunkHeight) / 2
      ) {
        this.loadPrevChunk();
      }
    }
  }

  getTile(xpos: number, ypos: number): Cell | null {
    return (
      this.currentChunk?.getCellByPoint(xpos, ypos) ??
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
    this.previousChunk = this.currentChunk;
    this.currentChunk = newChunk;
    this.add(this.currentChunk);
  }

  loadPrevChunk(): void {
    if (this.onScreenChunkId > 0) {
      this.onScreenChunkId--;
      console.log("Loading chunk id: ", this.onScreenChunkId);
      const newChunk = this.generateChunk(
        this.onScreenChunkId * (config.TileWidth * config.ChunkHeight) +
          this.start * config.TileWidth
      );

      if (this.currentChunk) {
        this.remove(this.currentChunk);
      }

      this.currentChunk = this.previousChunk;
      this.previousChunk = newChunk;
      this.add(newChunk);
    }
  }
}
