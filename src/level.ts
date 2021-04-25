import {
  Axis,
  BoundingBox,
  Cell,
  ElasticToActorStrategy,
  Engine,
  Graphics,
  Input,
  LimitCameraBoundsStrategy,
  LockCameraToActorAxisStrategy,
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
import { PowerUp } from "./powerup";
import {
  DirtTag,
  DirtTerrain,
  EmptyTag,
  EmptyTerrain,
  RockTag,
  RockTerrain,
  Terrain,
} from "./terrain";
import { GlobalState } from "./globalState";
import { Background } from "./background";

class WeightPair<T> {
  constructor(weight: number, obj: T) {
    this.weight = weight;
    this.obj = obj;
  }
  weight: number;
  obj: T;
}
class WeightMap<T> {
  total: number = 0;
  pairs: WeightPair<T>[] = [];
  random: Random;

  constructor(random: Random) {
    this.random = random;
  }

  add(weight: number, obj: T) {
    this.total += weight;
    this.pairs.push(new WeightPair<T>(weight, obj));
  }

  randomSelect(defObj: T): T {
    const roll = this.random.next() * this.total;
    var total = 0;
    var obj: T | null = null;
    this.pairs.forEach((a) => {
      if (obj) return;
      if (roll - total <= a.weight) {
        obj = a.obj;
      }
      total += a.weight;
    });
    return obj ?? defObj;
  }
}

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen
  random = new Random(config.RandomSeed);
  terrainWeightMap: WeightMap<Terrain> = new WeightMap(this.random);

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  currentChunk: TileMap | null = null;

  background!: Background;

  player: Player | null = null;
  snek: Snek | null = null;

  gameOver: GameOver | null = null;

  chunks: TileMap[] = [];

  state: GlobalState = GlobalState.GetInstance();

  onInitialize(engine: Engine) {
    // engine.input.keyboard.on('press', (evt) => {
    //     if (evt.key === Input.Keys.L) {
    //         this.gameOver?.updateEndScreen();
    //         this.gameOver?.show();
    //         this.state.GameOver = true;
    //     }
    // });

    Terrain.Initialize();

    this.player = new Player(this);
    this.snek = new Snek(this);
    this.gameOver = new GameOver(engine.drawWidth, engine.drawHeight);

    this.add(this.player);
    this.add(this.snek);
    this.add(this.gameOver);

    this.camera.addStrategy(new ElasticToActorStrategy(this.player, 0.2, 0.2));
    this.camera.on("postupdate", (e) => {
      this.camera.pos.x = this.camera.viewport.width / 2;
    });

    // this.camera.strategy.lockToActorAxis(this.player, Axis.X);

    // this.camera.strategy.elasticToActor(this.player, .2, .2);

    this.background = new Background(this);

    this.buildTerrainWeightMap();
    const tileMap = this.generateChunk(config.TileWidth * this.start);
    this.setCellToTerrain(tileMap.getCellByIndex(4), DirtTerrain); // Make sure the player entry is always allowed.

    this.previousChunk = null;
    this.add((this.currentChunk = tileMap));
    this.chunks.push(this.currentChunk);
  }

  buildTerrainWeightMap(): void {
    this.terrainWeightMap.add(20, RockTerrain);
    this.terrainWeightMap.add(80, DirtTerrain);
  }

  onPostUpdate() {
    if (this.currentChunk && this.player) {
      if (
        this.camera.pos.y >
        this.currentChunk.y + (config.TileWidth * config.ChunkHeight) / 2
      ) {
        this.loadNextChunk();
      }
    }

    if (this.previousChunk && this.player) {
      if (
        this.camera.pos.y <=
        this.previousChunk.y + (config.TileWidth * config.ChunkHeight) / 2
      ) {
        this.loadPrevChunk();
      }
    }
    this.checkGameOver();
  }

  checkGameOver() {
    if (this.state.GameOver) return;
    if (
      this.player?.pos.x == this.snek?.pos.x &&
      this.player?.pos.y == this.snek?.pos.y
    ) {
      this.gameOver?.updateEndScreen();
      this.gameOver?.show();
      this.state.GameOver = true;
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
      var terrain = this.terrainWeightMap.randomSelect(EmptyTerrain);
      this.setCellToTerrain(cell, terrain);
    }

    this.ValidateTileMap(tileMap, this.currentChunk);

    return tileMap;
  }

  ValidateTileMap(tile: TileMap, prev: TileMap | null) {
    var y = tile.y;
    var prevRow: Cell[] | null = null;

    if (prev) {
      prevRow = prev.data.filter((c) => {
        return c.y === y - tile.cellHeight;
      });
    }

    const defaultPathable = DirtTerrain;

    for (var i = 0; i < tile.rows; ++i) {
      const curRow = tile.data.filter((c) => {
        return c.y === y;
      });

      for (let x = 0; x < curRow.length; x++) {
        //only validate if there's a previous row
        if (!prevRow) {
          continue;
        }

        const curCell = curRow[x];
        const curTerrain = Terrain.GetTerrain(curRow[x]);
        const upperLeftTile = x != 0 ? prevRow[x - 1] : null;
        const upperRightTile = x != curRow.length - 1 ? prevRow[x + 1] : null;
        if (!upperLeftTile || !upperRightTile) {
          if (!curTerrain.mineable()) {
            this.setCellToTerrain(curCell, defaultPathable);
          }
          continue;
        }
        const upperLeftTerrain = Terrain.GetTerrain(upperLeftTile);
        const upperRightTerrain = Terrain.GetTerrain(upperRightTile);
        if (
          !upperLeftTerrain.mineable() &&
          !upperRightTerrain.mineable() &&
          !curTerrain.mineable()
        ) {
          this.setCellToTerrain(curCell, defaultPathable);
        }
      }

      y += tile.cellHeight;
      prevRow = curRow;
    }
  }

  loadNextChunk(): void {
    this.onScreenChunkId++;

    let newChunk: TileMap;
    console.log("Loading chunk id: ", this.onScreenChunkId);

    if (this.chunks[this.onScreenChunkId]) {
      newChunk = this.chunks[this.onScreenChunkId];
    } else {
      newChunk = this.generateChunk(
        this.onScreenChunkId * (config.TileWidth * config.ChunkHeight) +
          this.start * config.TileWidth
      );
      this.chunks.push(newChunk);
    }

    if (this.previousChunk) {
      this.remove(this.previousChunk);
      console.log("Removing previous chunk");
    }
    this.previousChunk = this.currentChunk;
    this.currentChunk = newChunk;
    this.background.setCurrentChunkId(this.onScreenChunkId);

    this.add(this.currentChunk);
  }

  loadPrevChunk(): void {
    if (this.onScreenChunkId !== 0) {
      this.onScreenChunkId--;
      console.log("Loading chunk id: ", this.onScreenChunkId);
      // We need to store away chunks that we've interacted with
      const newChunk = this.chunks[this.onScreenChunkId];

      //   const currentChunkId = this.chunks.indexOf(this.currentChunk as TileMap);
      if (this.currentChunk) {
        this.remove(this.currentChunk);
      }

      this.currentChunk = newChunk;
      this.previousChunk = this.chunks[this.onScreenChunkId - 1] ?? null;
      this.background.setCurrentChunkId(this.onScreenChunkId);
      this.add(newChunk);
      this.add(this.previousChunk);
    } else {
      this.currentChunk = this.chunks[0];
      this.previousChunk = null;
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

    this.setCellToTerrain(tile, EmptyTerrain);
  }

  setCellToTerrain(cell: Cell, terrain: Terrain) {
    const curTerrain = Terrain.GetTerrain(cell);
    if (terrain === EmptyTerrain) {
      if (curTerrain === EmptyTerrain) {
        return;
      }
      cell.clearSprites();
    }
    cell.removeComponent(curTerrain.tag(), true);
    var sprite = terrain.sprite();
    if (sprite) {
      cell.addSprite(sprite);
    }
    cell.addTag(terrain.tag());
  }
}
