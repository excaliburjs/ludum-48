import {
  Axis,
  Cell,
  Engine,
  Graphics,
  Random,
  Scene,
  TileMap,
  vec,
  Vector,
} from "excalibur";
import { Resources } from "./resources";
import { Player } from "./player";
import config from "./config";
import { Snek } from "./snek";
import { GameOver } from "./gameOver";
import {
  DirtTag,
  DirtTerrain,
  EmptyTag,
  RockTag,
  RockTerrain,
  Terrain,
} from "./terrain";

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen
  random = new Random(1337);

    dirtSprite!: Graphics.Sprite;
  rockSprite!: Graphics.Sprite;

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  currentChunk: TileMap | null = null;

  player: Player | null = null;
  snek: Snek | null = null;
  
  gameOver: GameOver | null = null;
  gameOverOccured: boolean = false;

  onInitialize(engine: Engine) {
    Terrain.Initialize();
    this.player = new Player(this);
    this.snek = new Snek(this);
    this.gameOver = new GameOver(engine.canvasWidth, engine.canvasHeight);

    this.add(this.player);
    this.add(this.snek);
    this.add(this.gameOver);

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
    this.checkGameOver();
  }

  checkGameOver(){
    if(this.gameOverOccured) return;
    if(this.player?.pos.x == this.snek?.pos.x && this.player?.pos.y == this.snek?.pos.y) {
      this.gameOver?.updateEndScreen();
      this.gameOver?.show();
      this.gameOverOccured = true;
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
    const tileMap = new TileMap({
      x: 0, // always the left
      y: yPos,
      rows: this.chunkHeight,
      cols: this.chunkWidth,
      cellWidth: config.TileWidth,
      cellHeight: config.TileWidth,
    });

    for (let cell of tileMap.data) {
      if (this.random.next() < 0.2) {
        var sprite = RockTerrain.sprite();
        if (sprite) {
          cell.addSprite(sprite);
        }
        cell.addTag(RockTag);
      } else {
        var sprite = DirtTerrain.sprite();
        if (sprite) {
          cell.addSprite(sprite);
        }
        cell.addTag(DirtTag);
      }
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

  finishDig(xpos: number, ypos: number): void {
    var tilemap = this.currentChunk;
    var tile = tilemap?.getCellByPoint(xpos, ypos);
    if (!tile) {
      tilemap = this.previousChunk;
      tile = tilemap?.getCellByPoint(xpos, ypos);
    }
    if (!tile) return;

    var terrain = Terrain.GetTerrain(tile);
    tile.clearSprites();
    tile.removeComponent(terrain.tag(), true);
    tile.addTag(EmptyTag);
  }
}
