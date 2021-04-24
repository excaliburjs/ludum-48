import {
  Actor,
  Color,
  EasingFunctions,
  Engine,
  Side,
  vec,
  Vector,
  Util,
} from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";

export class Player extends Actor {
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
    this.rotation = Math.PI / 2 + Math.PI / 4;
  }

  onInitialize(engine: Engine) {
    this.graphics.add(Resources.Sword.toSprite());
    engine.input.pointers.primary.on("down", (evt) => {
      // Find the best cardinal
      const dir = evt.pos.sub(this.pos);
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

      this.moveToNearestTile(this.pos.add(bestDir.scale(config.TileWidth)));
    });
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

    let isDistanceOne = distX + distY === 1;
    let tile = this.level.getTile(posX, posY);
    return isDistanceOne && !!tile;
  }

  moveToNearestTile(worldPos: Vector) {
    const tileX = Math.floor(worldPos.x / config.TileWidth);
    const tileY = Math.floor(worldPos.y / config.TileWidth);

    const validMove = this.isValidMove(worldPos.x, worldPos.y);

    if (validMove) {
      // TODO play digging animation
      // TODO after time remove tile
      this.actions.easeTo(
        tileX * config.TileWidth + config.TileWidth / 2,
        tileY * config.TileWidth + config.TileWidth / 2,
        500,
        EasingFunctions.EaseInOutCubic
      );
    }
  }
}
