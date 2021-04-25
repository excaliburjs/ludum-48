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
  EmptyTerrain,
  RockTag,
  RockTerrain,
  Terrain,
} from "./terrain";
import { GlobalState } from "./globalState";

class WeightPair {
  constructor(weight: number, terrain: Terrain) {
    this.weight = weight;
    this.terrain = terrain;
  }
  weight: number;
  terrain: Terrain;
}
class TerrainWeightMap {
  total: number = 0;
  pairs: WeightPair[] = [];
  random: Random;

  constructor(random: Random) {
    this.random = random;
  }

  add(weight: number, terrain: Terrain) {
    this.total += weight;
    this.pairs.push(new WeightPair(weight, terrain));
  }

  randomSelect(): Terrain {
    const roll = this.random.next() * this.total;
    var total = 0;
    var terrain: Terrain | null = null;
    this.pairs.forEach((a) => {
      if (terrain) return;
      if (roll - total <= a.weight) {
        terrain = a.terrain;
      }
      total += a.weight;
    });
    return terrain ?? EmptyTerrain;
  }
}

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen
  random = new Random(config.RandomSeed);
  terrainWeightMap: TerrainWeightMap = new TerrainWeightMap(this.random);

  dirtSprite!: Graphics.Sprite;
  rockSprite!: Graphics.Sprite;

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  currentChunk: TileMap | null = null;

  player: Player | null = null;
  snek: Snek | null = null;

  gameOver: GameOver | null = null;

  chunks: TileMap[] = [];

  state: GlobalState = GlobalState.GetInstance();

  onInitialize(engine: Engine) {
    Terrain.Initialize();
    this.dirtSprite = Resources.Dirt.toSprite();
    this.rockSprite = Resources.Rock.toSprite();
    this.player = new Player(this);
    this.snek = new Snek(this);
    this.gameOver = new GameOver(engine.canvasWidth, engine.canvasHeight);

    this.add(this.player);
    this.add(this.snek);
    this.add(this.gameOver);

    // Camera follows actor's Y Axis
    this.camera.strategy.lockToActorAxis(this.player, Axis.Y);

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
      var terrain = this.terrainWeightMap.randomSelect();
      this.setCellToTerrain(cell, terrain);
    }

    this.ValidateTileMap(tileMap);

    return tileMap;
  }

  ValidateTileMap(tile: TileMap) {
    var y = tile.y;
    var prevRow: Cell[] | null = null;
    const defaultPathable = DirtTerrain;

    for (var i = 0; i < tile.rows; ++i) {
      const curRow = tile.data.filter((c) => {
        return c.y === y;
      });


      for(let x = 0; x < curRow.length; x++) {
        //only validate if there's a previous row
        if(!prevRow) { continue; }

        const curCell = curRow[x];
        const curTerrain = Terrain.GetTerrain(curRow[x]);
        const upperLeftTile = x != 0 ? prevRow[x-1] : null;
        const upperRightTile = x != curRow.length -1 ? prevRow[x+1] : null;
        if(!upperLeftTile || !upperRightTile) {
          if(Terrain.SolidTerrain().includes(curTerrain)) {
            this.setCellToTerrain(curCell, defaultPathable);
          }
          continue;
        }
        const upperLeftTerrain = Terrain.GetTerrain(upperLeftTile);  
        const upperRightTerrain = Terrain.GetTerrain(upperRightTile); 
        if(
          Terrain.SolidTerrain().includes(upperLeftTerrain)
          && Terrain.SolidTerrain().includes(upperRightTerrain)
          && Terrain.SolidTerrain().includes(curTerrain)
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
