import {
  Cell,
  ElasticToActorStrategy,
  Engine,
  Random,
  Scene,
  TileMap,
  Color,
  Graphics
} from "excalibur";
import { Player } from "./player";
import config from "./config";
import { Snek } from "./snek";
import { GameOver } from "./gameOver";
import { PowerUpTimer, PowerUp, Collectible } from "./powerup";
import {
  DirtTerrain,
  EmptyTerrain,
  RockTerrain,
  Terrain,
  EmptyTag,
  TunnelTerrain,
  TunnelSides,
} from "./terrain";
import { GlobalState } from "./globalState";
import { Background } from "./background";
import { WeightMap } from "./weightmap"
import { ProgressMeter } from "./progress-meter";

export class Level extends Scene {
  start = 5; // tiles down
  chunkWidth = config.ChunkWidth;
  chunkHeight = config.ChunkHeight; // full screen
  terrainRandom = new Random(config.TerrainRandomSeed);
  collectibleRandom = new Random(config.CollectibleRandomSeed);
  terrainWeightMap: WeightMap<Terrain> = new WeightMap(this.terrainRandom);
  collectibleWeightMap: WeightMap<Collectible> = new WeightMap(this.collectibleRandom);

  onScreenChunkId = 0;
  previousChunk: TileMap | null = null;
  currentChunk: TileMap | null = null;

  background!: Background;

  player: Player | null = null;
  snek: Snek | null = null;

  progressMeter: ProgressMeter | null = null;

  gameOver: GameOver | null = null;

  chunks: TileMap[] = [];

  state: GlobalState = GlobalState.GetInstance();
  speedPowerUp!: PowerUp;


  onInitialize(engine: Engine) {
    // engine.input.keyboard.on('press', (evt) => {
    //     if (evt.key === Input.Keys.L) {
    //         this.gameOver?.updateEndScreen();
    //         this.gameOver?.show();
    //         this.state.GameOver = true;
    //     }
    // });

    Terrain.Initialize();

    let speedPowerUpTimer = new PowerUpTimer(
      this,
      () => {
        this.state.HasSpeedPowerUp = true;
      },
      () => {
        this.state.HasSpeedPowerUp = false;
      },
      config.PowerUpDurationSeconds
    );

    this.player = new Player(this);
    this.snek = new Snek(this);
    this.gameOver = new GameOver(engine.drawWidth, engine.drawHeight);
    this.progressMeter = new ProgressMeter();

    this.add(this.player);
    this.add(this.snek);
    this.add(this.gameOver);
    this.add(this.progressMeter);

    this.camera.addStrategy(new ElasticToActorStrategy(this.player, 0.2, 0.2));
    this.camera.on("postupdate", (e) => {
      this.camera.pos.x = this.camera.viewport.width / 2;
    });

    // this.camera.strategy.lockToActorAxis(this.player, Axis.X);

    // this.camera.strategy.elasticToActor(this.player, .2, .2);

    this.background = new Background(this);

    this.buildTerrainWeightMap();
    this.buildCollectibleWeightMap(speedPowerUpTimer);
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

  buildCollectibleWeightMap(speedPowerUpTimer: PowerUpTimer): void {
    let speedPowerUpSprite = Resources.SpeedPowerUp.toSprite()
    this.speedPowerUp = new PowerUp(speedPowerUpSprite, speedPowerUpTimer)
    this.collectibleWeightMap.add(1, this.speedPowerUp)
    this.collectibleWeightMap.add(99, null)
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
    this.updateProgress();
    this.checkGameOver();
  }

  updateProgress() {
    // Each tile is a "M"
    const progress =
      Math.max(this.player!.pos.y - this.start * config.TileWidth, 0) /
      config.TileWidth;
    this.progressMeter!.updateProgress(progress);
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
      this.setCellToTerrain(cell, terrain!);
      if (terrain!.tag() === "dirt") {
        var collectible = this.collectibleWeightMap.randomSelect(null);
        this.setCellCollectible(cell, collectible)
      }
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
          if (curTerrain.mineable()) {
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
      this.background.setCurrentChunkId(this.onScreenChunkId - 1);
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

    const tunnelTerrain = new TunnelTerrain(
      this.determineTunnelSidesForCell(tile)
    );

    this.setCellToTerrain(tile, tunnelTerrain);

    //
    // Clean up edges from neighboring cells
    //
    const neighbors = this.getNeighbors(tile);
    if (neighbors.north?.hasTag(EmptyTag)) {
      this.setCellToTerrain(
        neighbors.north,
        new TunnelTerrain(this.determineTunnelSidesForCell(neighbors.north))
      );
    }
    if (neighbors.south?.hasTag(EmptyTag)) {
      this.setCellToTerrain(
        neighbors.south,
        new TunnelTerrain(this.determineTunnelSidesForCell(neighbors.south))
      );
    }
    if (neighbors.west?.hasTag(EmptyTag)) {
      this.setCellToTerrain(
        neighbors.west,
        new TunnelTerrain(this.determineTunnelSidesForCell(neighbors.west))
      );
    }
    if (neighbors.east?.hasTag(EmptyTag)) {
      this.setCellToTerrain(
        neighbors.east,
        new TunnelTerrain(this.determineTunnelSidesForCell(neighbors.east))
      );
    }
  }

  getNeighbors(cell: Cell) {
    const north = this.getTile(cell.x, cell.y - cell.height);
    const south = this.getTile(cell.x, cell.y + cell.height);
    const east = this.getTile(cell.x + cell.width, cell.y);
    const west = this.getTile(cell.x - cell.width, cell.y);

    return {
      north,
      south,
      east,
      west,
    };
  }

  determineTunnelSidesForCell(cell: Cell) {
    const sides: TunnelSides = {
      north: false,
      south: false,
      east: false,
      west: false,
    };
    const { north, south, east, west } = this.getNeighbors(cell);

    if (east && !east.hasTag(EmptyTag)) {
      sides.east = true;
    }

    if (west && !west.hasTag(EmptyTag)) {
      sides.west = true;
    }

    if (south && !south?.hasTag(EmptyTag)) {
      sides.south = true;
    }

    if (north && !north.hasTag(EmptyTag)) {
      sides.north = true;
    }

    return sides;
  }

  setCellToTerrain(cell: Cell, terrain: Terrain) {
    const curTerrain = Terrain.GetTerrain(cell);
    if (terrain.tag() === EmptyTag) {
      // if (curTerrain.tag() === EmptyTag) {
      //   return;
      // }
      cell.clearSprites();
    }
    cell.removeComponent(curTerrain.tag(), true);
    var sprites = terrain.sprites();
    if (sprites) {
      sprites.forEach((sprite) => cell.addSprite(sprite));
    }
    cell.addTag(terrain.tag());
  }

  setCellCollectible(cell: Cell, collectible: Collectible | null) {
    if (collectible) {
      cell.addSprite(collectible.sprite)
    }
  }
}
