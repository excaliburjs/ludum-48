import {
  Axis,
  Cell,
  Engine,
  Graphics,
  Random,
  Scene,
  TileMap,
  vec,
} from "excalibur";
import { Resources } from "./resources";
import { Player } from "./player";
import config from "./config";
import { Snek } from "./snek";
import {
  DirtTag,
  DirtTerrain,
  EmptyTag,
  EmptyTerrain,
  RockTag,
  RockTerrain,
  Terrain,
} from "./terrain";
import { Dictionary } from "underscore";

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
  random = new Random(1337);
  terrainWeightMap: TerrainWeightMap = new TerrainWeightMap(this.random);

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  currentChunk: TileMap | null = null;

  player: Player | null = null;
  snek: Snek | null = null;

  onInitialize(engine: Engine) {
    Terrain.Initialize();
    this.player = new Player(this);
    this.snek = new Snek(this);

    this.add(this.player);
    this.add(this.snek);

    // Camera follows actor's Y Axis
    this.camera.strategy.lockToActorAxis(this.player, Axis.Y);

    this.buildTerrainWeightMap();
    const tileMap = this.generateChunk(config.TileWidth * this.start);
    this.setCellToTerrain(tileMap.getCellByIndex(4), DirtTerrain); // Make sure the player entry is always allowed.

    this.previousChunk = null;
    this.add((this.currentChunk = tileMap));
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
    for (var i = 0; i < tile.rows; ++i) {
      const row = tile.data.filter((c) => {
        return c.y === y;
      });
      const pathable = row.filter((c) => {
        const terr = Terrain.GetTerrain(c);
        return terr.mineable();
      });

      // TODO add more checks
      if (pathable.length == 0) {
        const index = Math.floor(this.random.next() * row.length);
        const makePathable = row[index];
        this.setCellToTerrain(makePathable, DirtTerrain);

        if (prevRow) {
          this.setCellToTerrain(prevRow[index], DirtTerrain);
        }
      }
      y += tile.cellHeight;
      prevRow = row;
    }
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
