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

export class Player extends Actor {
  private trail: PlayerTrail = PlayerTrail.GetInstance();

  private moving = false;
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

    engine.input.keyboard.on("hold", (evt) => {
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
      // Find the best cardinal
      let dir = evt.pos.sub(this.pos).normalize();
      let bestDir = this.bestDirection(dir);

      this.moveToNearestTile(this.pos.add(bestDir.scale(config.TileWidth)));
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
    

      // Cant move through rock
      if (tile?.hasTag("rock")) {
        Resources.ClankSound.play();
        this.actions.delay(config.RockDigDelay).callMethod(() => {
          this.moving = false;
        });
      // Can move through dirt or empty space
      } else if (tile?.hasTag("dirt") || tile?.hasTag("empty")) {

        if (tile.hasTag("dirt")) {
          Resources.DigSound.play();
          this.actions.delay(config.DigTime).callMethod(() => {
            tile.removeComponent('dirt', true);
            tile.addTag('empty');
            tile.clearSprites();
          });

        }

        this.actions
        .easeTo(
          tileX * config.TileWidth + config.TileWidth / 2,
          tileY * config.TileWidth + config.TileWidth / 2,
          500,
          EasingFunctions.EaseInOutCubic
          )
          .callMethod(() => {
            this.level.finishDig(this.pos.x, this.pos.y);
            this.moving = false;
          });
          this.trail.enqueue(this.pos.clone());
      }
    }
  }
}
