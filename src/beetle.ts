import {
  Actor,
  Color,
  EasingFunctions,
  Engine,
  Graphics,
  Random,
  RotationType,
  Traits,
  Vector,
} from "excalibur";
import { Level } from "./level";
import config from "./config";
import { Terrain } from "./terrain";
import { Every } from "./every";
import { Resources } from "./resources";
export class Beetle extends Actor {
  static random = new Random(1337);
  private moving = false;
  private moveBeetleTimer = new Every.Second(() => {
    this.moveBeetle();
  }, 1000 / 1000);

  private sprite!: Graphics.Sprite;

  constructor(x: number, y: number, private level: Level) {
    super({
      x,
      y,
      width: config.TileWidth,
      height: config.TileWidth,
      color: Color.Blue,
    });
    this.z = 20;
    this.traits = this.traits.filter(
      (t) => !(t instanceof Traits.TileMapCollisionDetection)
    );
  }

  onInitialize() {
    this.sprite = Resources.Beetle.toSprite();
    this.graphics.use(this.sprite);
  }

  moveBeetle() {
    let dirs = [Vector.Up, Vector.Down, Vector.Left, Vector.Right];

    dirs = dirs.filter((d) => {
      const maybeDir = this.pos.add(d.scale(config.TileWidth));
      return this.isValidMove(maybeDir.x, maybeDir.y);
    });

    if (dirs.length > 0) {
      const randomDirIndex = Beetle.random.integer(0, dirs.length - 1);
      const randomeDir = dirs[randomDirIndex];
      this.moveToNearestTile(this.pos.add(randomeDir.scale(config.TileWidth)));
    }
  }

  onPreUpdate(_engine: Engine, delta: number) {
    if (!this.isOffScreen) {
      this.moveBeetleTimer.Update(delta);
      if (this.vel.size !== 0) {
        this.rotation = Math.atan2(this.vel.y, this.vel.x);
      }
    }
  }

  isValidMove(posX: number, posY: number) {
    const tileX = Math.floor(posX / config.TileWidth);
    const tileY = Math.floor(posY / config.TileWidth);

    const playerTileX = Math.floor(this.pos.x / config.TileWidth);
    const playerTileY = Math.floor(this.pos.y / config.TileWidth);

    const distX = Math.abs(playerTileX - tileX);
    const distY = Math.abs(playerTileY - tileY);

    let isDistanceOne = Math.sqrt(distX * distX + distY * distY) === 1;
    let tile = this.level.getTile(posX, posY);
    return isDistanceOne && !!tile;
  }

  moveToNearestTile(worldPos: Vector) {
    const tileX = Math.floor(worldPos.x / config.TileWidth);
    const tileY = Math.floor(worldPos.y / config.TileWidth);

    const validMove = this.isValidMove(worldPos.x, worldPos.y);

    if (validMove) {
      if (!this.moving) {
        this.moving = true;
      } else {
        return;
      }

      const currentTile = this.level.getTile(this.pos.x, this.pos.y);
      const futureTile = this.level.getTile(worldPos.x, worldPos.y);

      this.actions.rotateTo(
        Math.atan2(worldPos.y - this.pos.y, worldPos.x - this.pos.x),
        100,
        RotationType.ShortestPath
      );

      if (futureTile) {
        const terrain = Terrain.GetTerrain(futureTile);
        let digDelay = terrain.delay();
        if (terrain.mineable() && !Terrain.HasBeetle(futureTile)) {
          futureTile.addTag("beetle");
          this.actions.delay(digDelay).callMethod(() => {
            this.level.finishDig(worldPos.x, worldPos.y);
          });
          this.actions
            .easeTo(
              tileX * config.TileWidth + config.TileWidth / 2,
              tileY * config.TileWidth + config.TileWidth / 2,
              config.BeetleSpaceMoveDuration,
              EasingFunctions.EaseInOutCubic
            )
            .callMethod(() => {
              this.moving = false;
              currentTile?.removeComponent("beetle", true);
            });
        }
      }
    }
  }
}
