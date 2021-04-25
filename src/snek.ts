import {
  Actor,
  EasingFunctions,
  Engine,
  Graphics,
  vec,
  Vector,
  Traits,
} from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";
import { Every } from "./every";
export class Snek extends Actor {
  private playerTrail: PlayerTrail = PlayerTrail.GetInstance();
  private snekCurrentSecondsPerSquare: number =
    config.SnekStartingSecondsPerSquare;
  private snekCalculatedSecondsPerSquare: number =
    config.SnekStartingSecondsPerSquare;
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

  private spritesheet = Graphics.SpriteSheet.fromGrid({
    image: Resources.Snek,
    grid: {
      rows: 1,
      columns: 8,
      spriteHeight: 64,
      spriteWidth: 64,
    },
  });

  constructor(public level: Level) {
    super({
      pos: vec(0, config.TileWidth * 5 - config.TileWidth / 2),
      width: config.TileWidth,
      height: config.TileWidth,
    });
    this.z = 11;
    this.traits = this.traits.filter(
      (t) => !(t instanceof Traits.TileMapCollisionDetection)
    );
  }

  onInitialize(engine: Engine) {
    this.graphics.add(this.spritesheet.sprites[config.SnekBodyLength]);
    this.createSnekBody();
  }

  onPreUpdate(_engine: Engine, _delta: number): void {
    if (this.vel.size !== 0) {
      this.rotation = Math.atan2(this.vel.y, this.vel.x);
    }

    this.moveSnekTimer.UpdateInterval(this.snekCurrentSecondsPerSquare);

    this.updateFunctions.forEach((fun) => fun.Update(_delta));
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
        config.SnakeMoveDuration,
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
        x: this.pos.x - (i + 1) * config.TileWidth,
        y: this.pos.y,
        width: config.TileWidth,
        height: config.TileWidth,
      });
      bodySegment.traits = bodySegment.traits.filter(
        (t) => !(t instanceof Traits.TileMapCollisionDetection)
      );
      bodySegment.graphics.add(
        this.spritesheet.sprites[config.SnekBodyLength - (i + 1)]
      );
      bodySegment.onPreUpdate = () => {
        const first = i === 0;
        const last = i === config.SnekBodyLength - 1;
        if (bodySegment.vel.size !== 0) {
          var prior: Actor; // Towards the head
          var next: Actor; // Towards the tail
          if (first) {
            prior = this; // Snake head
            next = this.snekBody[1];
          } else if (last) {
            prior = this.snekBody[i - 1];
            next = bodySegment;
          } else {
            prior = this.snekBody[i + 1];
            next = this.snekBody[i - 1];
          }
          bodySegment.rotation = Math.atan2(
            prior.pos.y - next.pos.y,
            prior.pos.x - next.pos.x
          );
        }
      };

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
      config.SnakeMoveDuration,
      EasingFunctions.EaseInOutCubic
    );

    // move each remaining segment to the position that the one ahead of it was occupying
    for (let i = 1; i < this.snekBody.length; i++) {
      this.snekBody[i].actions.easeTo(
        snekBodyLocations[i - 1].x * config.TileWidth + config.TileWidth / 2,
        snekBodyLocations[i - 1].y * config.TileWidth + config.TileWidth / 2,
        config.SnakeMoveDuration,
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
