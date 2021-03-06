import {
  Actor,
  EasingFunctions,
  Engine,
  Graphics,
  vec,
  Vector,
  Traits,
  Random,
} from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";
import { Every } from "./every";
import { GlobalState } from "./globalState";
export class Snek extends Actor {
  private state: GlobalState;
  private playerTrail: PlayerTrail = PlayerTrail.GetInstance();
  private timePerTile: number = config.SnekStartingSpeed;
  private chuChuCooldown: number = 0;

  // private snekCalculatedSecondsPerSquare: number =
  //   config.SnekStartingSecondsPerSquare;

  private moving: Boolean = false;

  private snekBody: Actor[] = [];

  private isMouthOpen = false;

  private moveSnekTimer = new Every.Second(() => {
    this.moveSnek();
  }, this.timePerTile / 1000);

  private updateSnekTimer = new Every.Second(() => {
    this.updateSnekSpeedv2();
  }, 1);

  private updateFunctions: Every.Interval[] = [
    this.moveSnekTimer,
    this.updateSnekTimer,
  ];

  private spritesheet = Graphics.SpriteSheet.fromGrid({
    image: Resources.Snek,
    grid: {
      rows: 1,
      columns: 72,
      spriteHeight: 96,
      spriteWidth: 96,
    },
  });

  // default animations

  private headAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [7, 15, 23],
    300,
    Graphics.AnimationStrategy.PingPong
  );

  private bodyDefaultAnimations: Graphics.Animation[] = [];

  private body1Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [6, 14, 22],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body2Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [5, 13, 21],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body3Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [4, 12, 20],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body4Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [3, 11, 19],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body5Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [2, 10, 18],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body6Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [1, 9, 17],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body7Anim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [0, 8, 16],
    500,
    Graphics.AnimationStrategy.PingPong
  );

  // snake open mouth
  private mouthAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [55, 63, 71],
    50,
    Graphics.AnimationStrategy.Freeze
  );

  private mouthAnimReverse = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [71, 63, 55],
    50,
    Graphics.AnimationStrategy.Freeze
  );
  

  // turbo animations

  private headTurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [31, 39, 47, 55],
    300,
    Graphics.AnimationStrategy.PingPong
  );
  private bodyTurboAnimations: Graphics.Animation[] = [];

  private body1TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [30, 38, 46, 54],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body2TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [29, 37, 45, 53],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body3TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [28, 36, 44, 52],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body4TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [27, 35, 43, 51],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body5TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [26, 34, 42, 50],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body6TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [25, 33, 41, 49],
    config.SnakeAnimationFrameDuration,
    Graphics.AnimationStrategy.PingPong
  );

  private body7TurboAnim = Graphics.Animation.fromSpriteSheet(
    this.spritesheet,
    [24, 32, 40, 48],
    500,
    Graphics.AnimationStrategy.PingPong
  );


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
    this.state = GlobalState.GetInstance();

    this.bodyDefaultAnimations = [
      this.body1Anim,
      this.body2Anim,
      this.body3Anim,
      this.body4Anim,
      this.body5Anim,
      this.body6Anim,
      this.body7Anim,
    ];
    this.bodyTurboAnimations = [
      this.body1TurboAnim,
      this.body2TurboAnim,
      this.body3TurboAnim,
      this.body4TurboAnim,
      this.body5TurboAnim,
      this.body6TurboAnim,
      this.body7TurboAnim,
    ];
  }

  onInitialize(engine: Engine) {
    // this.graphics.add(this.spritesheet.sprites[config.SnekBodyLength]); // add the graphic of the head
    this.graphics.add("default", this.headAnim);
    this.graphics.add("turbo", this.headTurboAnim);
    this.graphics.add("openMouth", this.mouthAnim);
    this.graphics.add("closeMouth", this.mouthAnimReverse);
    // this.graphics.show("default");
    // console.log(this.spritesheet.sprites);
    this.createSnekBody();
  }

  onPreUpdate(_engine: Engine, _delta: number): void {
    if (this.vel.size !== 0) {
      this.rotation = Math.atan2(this.vel.y, this.vel.x);
    }

    if (this.state.GameOver) return;

    this.moveSnekTimer.UpdateInterval(this.timePerTile / 1000);

    this.updateFunctions.forEach((fun) => fun.Update(_delta));
  }

  updateSnekSpeedv2() {
    const playerPos = this.playerTrail.peekLast();
    if (!!playerPos) {
      const distX = playerPos.x - this.pos.x;
      const distY = playerPos.y - this.pos.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance > config.SnekFasterSpeedDistance * config.TileWidth) {
        console.log("FASTER SNEK");
        this.timePerTile = Math.min(config.SnekFasterSpeed, this.timePerTile);
        this.switchAnimation('turbo');
      }

      if (distance > config.SnekFastestSpeedDistance * config.TileWidth) {
        console.log("FASTEST SNEK");
        this.timePerTile = Math.min(config.SnekFastestSpeed, this.timePerTile);
        this.switchAnimation('turbo');
      }

      if (distance < config.SnekSlowDownDistance * config.TileWidth) {
        console.log("SLOW SNEK DOWN");
        this.timePerTile += config.SnekSlowDownBy;
        this.switchAnimation('default');
      }

      if (this.state.SnakePause) {
        console.log("SNEK slows down because your music was so cool");
        this.timePerTile += config.SnekSlowDownByAfterConcert;
        this.state.SnakePause = false;
        this.switchAnimation('default');
      }

      if (distance <= 128 && !this.isMouthOpen) {
        this.isMouthOpen = true;
        this.graphics.hide();
        this.graphics.show("openMouth");
      }
      if (distance > 128 && this.isMouthOpen) {
        this.graphics.hide();
        this.graphics.show("closeMouth");
        this.isMouthOpen = false;
      }
    }

    

    // Steam roll
    const trail = this.playerTrail.trail;
    if (trail.length >= 2 && this.chuChuCooldown-- <= 0) {
      let sameXCoordinate = 0;
      for (let i = 0; i < trail.length - 1; i++) {
        if (trail[i].x === trail[i + 1].x) {
          sameXCoordinate++;
        } else {
          break;
        }
      }
      if (sameXCoordinate >= config.SnekStraitDownCount) {
        console.log("CHU CHU!", sameXCoordinate);
        Resources.ChuChu.play();
        this.switchAnimation('turbo');
        this.timePerTile -= config.SnekStraitPathBoost;
        this.chuChuCooldown = config.SnekStraitPathBoostCooldown;
      }
    }
  }

  updateSnekSpeed() {
    // this.snekCalculatedSecondsPerSquare -= config.SnekAcceleration;
    // const playerPos = this.playerTrail.peekLast();
    // if (!!playerPos) {
    //   const distX = Math.abs(playerPos.x - this.pos.x);
    //   const distY = Math.abs(playerPos.y - this.pos.y);
    //   const distance = Math.sqrt(distX * distX + distY * distY);
    //   if (distance >= config.SnekSquaresDistanceBeforeCatchUpSpeed) {
    //     this.speedPerTile = Math.min(
    //       config.SnekCatchUpSecondsPerSquare,
    //       this.snekCalculatedSecondsPerSquare
    //     );
    //   }
    // }
    // if (this.speedPerTile <= config.SnekMinSecondsPerSquare) {
    //   this.speedPerTile = config.SnekMinSecondsPerSquare;
    // }
  }

  switchAnimation(key: string) {
    if (key === 'turbo') {
      if (!this.isMouthOpen) {
        this.graphics.hide();
        this.graphics.show("turbo");
      }
      for (let i = 0; i < config.SnekBodyLength; i++) {
        this.snekBody[i].graphics.hide();
        this.snekBody[i].graphics.show("turbo");
      }
    } else {
      if (!this.isMouthOpen) {
        this.graphics.hide();
        this.graphics.show("default");
      }
      for (let i = 0; i < config.SnekBodyLength; i++) {
        this.snekBody[i].graphics.hide();
        this.snekBody[i].graphics.show("default");
      }
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
        const sound = new Random().pickOne([
          Resources.DigSound1,
          Resources.DigSound2,
          Resources.DigSound3,
          Resources.DigSound4,
          Resources.DigSound5,
          Resources.DigSound6,
          Resources.DigSound7,
          Resources.DigSound8,
        ]);
    
        sound.play();
        
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

      // add the initial graphic for each segment
      bodySegment.graphics.add(
        "default",
        // this.spritesheet.sprites[config.SnekBodyLength - (i + 1)]
        this.bodyDefaultAnimations[i]
      );

      bodySegment.graphics.add(
        "turbo",
        // this.spritesheet.sprites[config.SnekBodyLength - (i + 1)]
        this.bodyTurboAnimations[i]
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
            prior = this.snekBody[i - 1];
            next = this.snekBody[i + 1];
          }
          let newRotation = Math.atan2(
            prior.pos.y - next.pos.y,
            prior.pos.x - next.pos.x
          );
          bodySegment.rotation = newRotation;
        }
      };

      this.snekBody.push(bodySegment);
    }

    // layering segments for smoother corner movement animations
    this.scene.add(this.snekBody[0]);
    this.scene.add(this.snekBody[2]);
    this.scene.add(this.snekBody[4]);
    this.scene.add(this.snekBody[6]);

    this.scene.add(this.snekBody[1]);
    this.scene.add(this.snekBody[3]);
    this.scene.add(this.snekBody[5]);
  }

  moveSnekBody(prevHeadX: number, prevHeadY: number) {
    const snekBodyLocations: Vector[] = this.getSnekBodyLocations();

    // move the first body segment to where the head just was
    this.snekBody[0].actions.easeTo(
      prevHeadX * config.TileWidth + config.TileWidth / 2,
      prevHeadY * config.TileWidth + config.TileWidth / 2,
      config.SnakeMoveDuration,
      EasingFunctions.EaseInOutCubic
    ); //todo play a cool steam animation or something on each joint

    // move each remaining segment to the position that the one ahead of it was occupying
    for (let i = 1; i < this.snekBody.length; i++) {
      this.snekBody[i].actions.easeTo(
        snekBodyLocations[i - 1].x * config.TileWidth + config.TileWidth / 2,
        snekBodyLocations[i - 1].y * config.TileWidth + config.TileWidth / 2,
        config.SnakeMoveDuration,
        EasingFunctions.EaseInOutCubic
      ); //todo play a cool steam animation or something on each joint
    }
  }

  getSnekBodyLocations(): Vector[] {
    return this.snekBody.map(
      (s) =>
        new Vector(
          Math.floor(s.pos.x / config.TileWidth),
          Math.floor(s.pos.y / config.TileWidth)
        )
    );
  }

  getSnekBodyGridCoords(): Vector[] {
    return this.snekBody.map((s) => s.pos.clone());
  }

  areNumbersApproximatelyEqual(value1: number, value2: number): boolean {
    const precision = 0.01;
    return Math.abs(value1 - value2) <= precision;
  }
}
