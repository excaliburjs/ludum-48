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
  Traits,
  Timer,
  Graphics,
} from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";
import { EmptyTag, Terrain } from "./terrain";
import { GlobalState } from "./globalState";
import { PowerUpTimer } from "powerup";

export class Player extends Actor {
  private trail: PlayerTrail = PlayerTrail.GetInstance();
  private state: GlobalState = GlobalState.GetInstance();
  private moving = false;
  private pointerHeld = false;
  private pointerScreenPos = vec(0, 0);
  private engine!: Engine;

  private startAngle = Math.PI / 2;
  private frontFacing!: Graphics.Sprite;
  private digAnimation!: Graphics.Animation;

  constructor(public level: Level) {
    super({
      pos: vec(
        config.TileWidth * 5 - config.TileWidth / 2,
        config.TileWidth * 5 - config.TileWidth / 2
      ),
      width: config.TileWidth,
      height: config.TileWidth,
    });

    this.z = 10;
    this.rotation = 0; // Math.PI;// Math.PI / 2 + Math.PI / 4;
    this.traits = this.traits.filter(
      (t) => !(t instanceof Traits.TileMapCollisionDetection)
    );
  }

  onInitialize(engine: Engine) {
    this.frontFacing = Resources.FrontFacing.toSprite();
    this.graphics.add(this.frontFacing);

    const spriteSheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.Digging,
      grid: {
        spriteWidth: 64,
        spriteHeight: 64,
        rows: 1,
        columns: 4,
      },
    });

    const anim = Graphics.Animation.fromSpriteSheet(
      spriteSheet,
      [0, 1, 2, 3],
      100,
      Graphics.AnimationStrategy.PingPong
    );
    anim.rotation = Math.PI;
    this.digAnimation = anim;

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
      this.rotation = Math.atan2(this.vel.y, this.vel.x) + this.startAngle; // + Math.PI ; /* + Math.PI / 4*/;
      this.graphics.use(this.digAnimation);
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
    this.graphics.use(this.digAnimation);
    const tileX = Math.floor(worldPos.x / config.TileWidth);
    const tileY = Math.floor(worldPos.y / config.TileWidth);

    const validMove = this.isValidMove(worldPos.x, worldPos.y);
    const movementBonus = this.state.HasSpeedPowerUp
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
          this.startAngle,
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
            if (!this.trail.Contains(this.pos.clone())) {
              this.trail.enqueue(this.pos.clone());
            } else {
              this.trail.RemoveLast();
            }
          });
      }
    }
  }
}
