import { Actor, Color, EasingFunctions, Engine, vec, Vector } from "excalibur";
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
    // TODO should player have a ref to the tilemap/onscreen
  }

  onInitialize(engine: Engine) {
    this.graphics.add(Resources.Sword.toSprite());
    engine.input.pointers.primary.on("down", (evt) => {
      this.moveToNearestTile(evt.pos);
    });
  }

  onPreUpdate() {
    if (this.vel.size !== 0) {
      this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
    }
  }

  isValidMove(tileX: number, tileY: number) {
    const playerTileX = Math.floor(this.pos.x / config.TileWidth);
    const playerTileY = Math.floor(this.pos.y / config.TileWidth);

    const distX = Math.abs(playerTileX - tileX);
    const distY = Math.abs(playerTileY - tileY);

    let isDistanceOne = distX + distY === 1;
    // TODO is this a tile in the onscreen chunk
    return isDistanceOne;
  }

  moveToNearestTile(worldPos: Vector) {
    const tileX = Math.floor(worldPos.x / config.TileWidth);
    const tileY = Math.floor(worldPos.y / config.TileWidth);

    // TODO is this a valid move
    const validMove = this.isValidMove(tileX, tileY);

    if (validMove) {
      this.actions.easeTo(
        tileX * config.TileWidth + config.TileWidth / 2,
        tileY * config.TileWidth + config.TileWidth / 2,
        500,
        EasingFunctions.EaseInOutCubic
      );
    }
  }
}
