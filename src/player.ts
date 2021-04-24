import { Actor, Color, EasingFunctions, Engine, vec, Vector } from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";

export class Player extends Actor {
  constructor(public level: Level) {
    super({
      pos: vec(64 * 5 - 32, 64 * 5 - 32),
      width: 64,
      height: 64,
    });
    this.z = 10;
    this.rotation = Math.PI / 2 + Math.PI / 4;
    // TODO should player have a ref to the tilemap/onscreen
  }

  onInitialize(engine: Engine) {
    this.graphics.add(Resources.Sword.toSprite());
    let isFirstClick = true;
    engine.input.pointers.primary.on("down", (evt) => {
      // Hack for excalibur bug
      if (isFirstClick) {
        isFirstClick = false;
        return;
      }
      this.moveToNearestTile(evt.pos);
    });
  }

  onPreUpdate() {
    if (this.vel.size !== 0) {
      this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
    }
  }

  isValidMove(tileX: number, tileY: number) {
    const playerTileX = Math.floor(this.pos.x / 64);
    const playerTileY = Math.floor(this.pos.y / 64);

    const distX = Math.abs(playerTileX - tileX);
    const distY = Math.abs(playerTileY - tileY);

    let isDistanceOne = distX + distY === 1;
    // TODO is this a tile in the onscreen chunk
    return isDistanceOne;
  }

  moveToNearestTile(worldPos: Vector) {
    const tileX = Math.floor(worldPos.x / 64);
    const tileY = Math.floor(worldPos.y / 64);

    // TODO is this a valid move
    const validMove = this.isValidMove(tileX, tileY);

    if (validMove) {
      this.actions.easeTo(
        tileX * 64 + 32,
        tileY * 64 + 32,
        500,
        EasingFunctions.EaseInOutCubic
      );
    }
  }
}
