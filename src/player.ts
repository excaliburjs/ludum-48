import {
  Actor,
  Color,
  EasingFunctions,
  Engine,
  Side,
  vec,
  Vector,
  Util,
  Input,
  RotationType,
} from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";
import { EmptyTag, Terrain } from "./terrain";
import { GlobalState } from "./globalState";

export class Player extends Actor {
  private trail: PlayerTrail = PlayerTrail.GetInstance();
  private state: GlobalState = GlobalState.GetInstance();
  private hasSpeedPowerUp = true;
  private moving = false;
  private pointerHeld = false;
  private pointerScreenPos = vec(0, 0);
  private engine!: Engine;
  constructor(public level: Level) {
    super({
      pos: vec(
        config.TileWidth * 5 - config.TileWidth / 2,
        config.TileWidth * 5 - config.TileWidth / 2
      ),
      width: config.TileWidth,
      height: config.TileWidth,
    });
    const startY = config.TileWidth * 5 - config.TileWidth / 2;
    this.trail.enqueue(new Vector(1 * config.TileWidth, startY));
    this.trail.enqueue(new Vector(2 * config.TileWidth, startY));
    this.trail.enqueue(new Vector(3 * config.TileWidth, startY));
    this.trail.enqueue(new Vector(4 * config.TileWidth, startY));
    this.z = 10;
    this.rotation = Math.PI / 2 + Math.PI / 4;
  }

  onInitialize(engine: Engine) {
    this.graphics.add(Resources.Sword.toSprite());
    this.engine = engine;
    engine.input.keyboard.on("hold", (evt) => {
      if (this.state.GameOver) return;
      let dir = Vector.Down;
      switch (evt.key) {
        case Input.Keys.A:
        case Input.Keys.Left:
          dir = Vector.Left;
          break;
        case Input.Keys.D:
        case Input.Keys.Right:
          dir = Vector.Right;
          break;
        case Input.Keys.S:
        case Input.Keys.Down:
          dir = Vector.Down;
          break;
        case Input.Keys.W:
        case Input.Keys.Up:
          dir = Vector.Up;
          break;
        default:
          return;
      }

      this.moveToNearestTile(this.pos.add(dir.scale(config.TileWidth)));
    });

    engine.input.pointers.primary.on("down", (evt) => {
      if (this.state.GameOver) return;
      this.pointerHeld = true;
      this.pointerScreenPos = evt.screenPos;
    });

    engine.input.pointers.primary.on("move", (evt) => {
      this.pointerScreenPos = evt.screenPos;
    });

    engine.input.pointers.primary.on("up", (evt) => {
      this.pointerHeld = false;
    });
  }

  bestDirection(dir: Vector): Vector {
    // Handle ambigous down cases between
    const angle = Math.atan2(dir.y, dir.x);
    if (angle < Math.PI - Math.PI / 16 && angle > Math.PI / 16) {
      dir = Vector.Down;
    }

    const cardinal = [Vector.Up, Vector.Down, Vector.Left, Vector.Right];
    let bestDir = Vector.Down;
    let mostDir = -Number.MAX_VALUE;

    for (let card of cardinal) {
      let currDir = dir.dot(card);
      if (currDir > mostDir) {
        mostDir = currDir;
        bestDir = card;
      }
    }
    return bestDir;
  }

  onPreUpdate() {
    if (this.vel.size !== 0) {
      this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
    }

    if (this.pointerHeld) {
      if (this.state.GameOver) return;
      // Find the best cardinal
      let actorScreenPos = this.engine.screen.worldToScreenCoordinates(
        this.pos
      );
      let dir = this.pointerScreenPos.sub(actorScreenPos).normalize();
      let bestDir = this.bestDirection(dir);

      this.moveToNearestTile(this.pos.add(bestDir.scale(config.TileWidth)));
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
    const movementBonus = this.hasSpeedPowerUp
      ? config.PowerUpSpeedIncreaseFactor
      : 1;

    if (validMove) {
      // if you are moving we wait otherwise weird things happen and players can make invalid moves
      if (!this.moving) {
        this.moving = true;
      } else {
        return;
      }

      // TODO play digging animation

      const tile = this.level.getTile(worldPos.x, worldPos.y);

      this.actions.rotateTo(
        Math.atan2(worldPos.y - this.pos.y, worldPos.x - this.pos.x) +
          Math.PI / 4,
        100,
        RotationType.ShortestPath
      );

      if (tile) {
        var terrain = Terrain.GetTerrain(tile);
        let digDelay = terrain.delay() / movementBonus;
        terrain.playSound();
        if (!terrain.mineable()) {
          this.actions.delay(digDelay).callMethod(() => {
            this.moving = false;
          });
          return;
        } else {
          this.actions.delay(digDelay).callMethod(() => {
            this.level.finishDig(worldPos.x, worldPos.y);
          });
        }

        this.actions
          .easeTo(
            tileX * config.TileWidth + config.TileWidth / 2,
            tileY * config.TileWidth + config.TileWidth / 2,
            config.SpaceMoveDuration / movementBonus,
            EasingFunctions.EaseInOutCubic
          )
          .callMethod(() => {
            this.moving = false;
            this.trail.enqueue(this.pos.clone());
          });
      }
    }
  }
}
