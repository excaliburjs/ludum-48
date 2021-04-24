import { Actor, Color, EasingFunctions, Engine, vec, Vector } from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";
import { Every } from "./every";
export class Snek extends Actor {
  private playerTrail: PlayerTrail = PlayerTrail.GetInstance();
  private snekCurrentSecondsPerSquare: number = config.SnekStartingSecondsPerSquare;
  private snekCalculatedSecondsPerSquare: number = config.SnekStartingSecondsPerSquare;
  private moving: Boolean = false;

  private snekBody: Actor[] = [];

  private moveSnekTimer = new Every.Second(() => {
    this.moveSnek();
  }, config.SnekStartingSecondsPerSquare);
  private updateSnekTimer = new Every.Second(() => {
    this.updateSnekSpeed();
  }, 1);

  private updateFunctions: Every.Interval[] = [
    this.moveSnekTimer,
    this.updateSnekTimer,
  ];

  constructor(public level: Level) {
    super({
      pos: vec(0, config.TileWidth * 5 - config.TileWidth / 2),
      width: config.TileWidth,
      height: config.TileWidth,
    });
    this.z = 11;
  }

  onInitialize(engine: Engine) {
    this.graphics.add(Resources.Sword.toSprite());
    this.createSnekBody();
  }

  onPreUpdate(_engine: Engine, _delta: number): void {
    this.moveSnekTimer.UpdateInterval(this.snekCurrentSecondsPerSquare);

    this.updateFunctions.forEach((fun) => fun.Update(_delta));

    if (this.vel.size !== 0) {
      this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
    }
  }

  updateSnekSpeed() {
    this.snekCalculatedSecondsPerSquare -= config.SnekAcceleration;
    const playerPos = this.playerTrail.peekLast();
    if (!!playerPos) {
      const distX = Math.abs(playerPos.x - this.pos.x);
      const distY = Math.abs(playerPos.y - this.pos.y);
      const distance = Math.sqrt(distX * distX + distY * distY);
      if (distance >= config.SnekSquaresDistanceBeforeCatchUpSpeed) {
        this.snekCurrentSecondsPerSquare = Math.min(
          config.SnekCatchUpSecondsPerSquare,
          this.snekCalculatedSecondsPerSquare
        );
      }
    }
    if (this.snekCurrentSecondsPerSquare <= config.SnekMinSecondsPerSquare) {
      this.snekCurrentSecondsPerSquare = config.SnekMinSecondsPerSquare;
    }
  }

  moveSnek() {
    if (this.moving) {
      return;
    }
    const place = this.playerTrail.dequeue();
    if (!place) {
      return;
    }
    const currentTileX = Math.floor(this.pos.x / config.TileWidth);
    const currentTileY = Math.floor(this.pos.y / config.TileWidth);

    this.moving = true;
    const tileX = Math.floor(place.x / config.TileWidth);
    const tileY = Math.floor(place.y / config.TileWidth);

    this.actions
      .easeTo(
        tileX * config.TileWidth + config.TileWidth / 2,
        tileY * config.TileWidth + config.TileWidth / 2,
        500,
        EasingFunctions.EaseInOutCubic
      )
      .callMethod(() => {
        this.moving = false;
      });

    this.moveSnekBody(currentTileX, currentTileY);
  }

  createSnekBody() {
    for (let i = 0; i < config.SnekBodyLength; i++) {
      const bodySegment = new Actor({
        x: this.pos.x,
        y: this.pos.y - (i + 1) * config.TileWidth,
        width: config.TileWidth,
        height: config.TileWidth,
        color: Color.Green,
      });
      this.snekBody.push(bodySegment);
      this.scene.add(bodySegment);
    }
  }

  moveSnekBody(prevHeadX: number, prevHeadY: number) {
    const snekBodyLocations: Vector[] = this.getSnekBodyLocations();

    // move the first body segment to where the head just was
    this.snekBody[0].actions.easeTo(
      prevHeadX * config.TileWidth + config.TileWidth / 2,
      prevHeadY * config.TileWidth + config.TileWidth / 2,
      500,
      EasingFunctions.EaseInOutCubic
    );

    for (let i = 1; i < this.snekBody.length; i++) {
      this.snekBody[i].actions.easeTo(
        snekBodyLocations[i - 1].x * config.TileWidth + config.TileWidth / 2,
        snekBodyLocations[i - 1].y * config.TileWidth + config.TileWidth / 2,
        500,
        EasingFunctions.EaseInOutCubic
      );
    }
  }

  getSnekBodyLocations() {
    const locations: Vector[] = [];
    for (let i = 0; i < this.snekBody.length; i++) {
      const bodySegment = this.snekBody[i];
      const location = new Vector(
        Math.floor(bodySegment.pos.x / config.TileWidth),
        Math.floor(bodySegment.pos.y / config.TileWidth)
      );
      locations[i] = location;
    }
    console.log({ locations });
    return locations;
  }
}
