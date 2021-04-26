import {
  Actor,
  Scene,
  Engine,
  vec,
  Vector,
  EasingFunctions,
  Util,
  Timer,
  Graphics,
  Random,
} from "excalibur";
import { Resources } from "./resources";
import config from "./config";
import { SoundManager } from "./sound-manager";
import { GlobalState } from "./globalState";
import { GameOver } from "./gameOver";

const BAND_POSITION_VECTORS = {
  drummer: vec(285, 617),
  guitarist: vec(162, 687),
  bassist: vec(523, 689),
  vocalist: vec(336, 685),
};

const UNDERGROUND_CONFIG = {
  fallDuration: 3000,
  fallRotationInDegreesPerSecond: 120,
  setDuration: 3000,
  setDurationAlt: 4000,
  leaveDuration: 1500,
  snekBodyRotationInDegreesPerSecondMin: 150,
  snekBodyRotationInDegreesPerSecondMax: 220,
  snekBodyMoveSpeed: 100,
};

export class UndergroundSet extends Scene {
  private background!: Actor;
  private drummer: Actor | undefined;
  private guitarist: Actor | undefined;
  private bassist: Actor | undefined;
  private vocalist: Actor | undefined;

  private drummerPos!: Vector;
  private guitaristPos!: Vector;
  private vocalistPos!: Vector;
  private bassistPos!: Vector;

  private state: GlobalState;
  private gameOver!: GameOver;

  constructor(private playerScreenPos: Vector) {
    super();

    this.state = GlobalState.GetInstance();
  }

  onInitialize(engine: Engine) {
    this.camera.pos = vec(0, 0);

    this.gameOver = new GameOver(engine.drawWidth, engine.drawHeight);

    this.background = new Actor({
      x: 0,
      y: 0,
      width: engine.drawWidth,
      height: engine.drawHeight,
      anchor: vec(0, 0),
    });
    const group = new Graphics.GraphicsGroup({
      members: [
        {
          graphic: Resources.UndergroundSet.toSprite(),
          pos: vec(0, 0),
        },
        {
          graphic: Resources.UndergroundSetInstruments.toSprite(),
          pos: vec(0, 0),
        },
      ],
    });
    this.background.graphics.add(group);
    this.background.graphics.add("empty", Resources.UndergroundSet.toSprite());

    this.add(this.background);
    this.add(this.gameOver);

    const spawnPos = engine.screenToWorldCoordinates(
      vec(this.playerScreenPos.x, 0)
    );

    this.drummer = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.guitarist = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.bassist = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.vocalist = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });

    this.drummer.graphics.add(Resources.MeerkatDrummerFrontFacing.toSprite());
    this.guitarist.graphics.add(
      Resources.MeerkatGuitaristFrontFacing.toSprite()
    );
    this.bassist.graphics.add(Resources.MeerkatBassistFrontFacing.toSprite());
    this.vocalist.graphics.add(Resources.MeerkatVocalistFrontFacing.toSprite());

    this.add(this.drummer);
    this.add(this.guitarist);
    this.add(this.bassist);
    this.add(this.vocalist);

    this.drummerPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.drummer
    );
    this.guitaristPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.guitarist
    );
    this.bassistPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.bassist
    );
    this.vocalistPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.vocalist
    );
  }

  /**
   * Transition by appearing?
   *
   * Meerkats tumble down into their band positions.
   * They switch to the animated versions (replace instruments).
   * They play quick few riffs.
   * The snake gets damaged.
   * The snake gets angry.
   * The snake goes after them again.
   * They tumble back into a group.
   * They auto-dig down to bottom of screen, snake follows.
   *
   * Transition to new level (wipe?) from top of screen.
   */
  onActivate() {
    SoundManager.muteBackgroundMusic();
    this.drummer!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );
    this.guitarist!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );
    this.vocalist!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );
    this.bassist!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );

    this.drummer!.actions.easeTo(
      this.drummerPos.x,
      this.drummerPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.guitarist!.actions.easeTo(
      this.guitaristPos.x,
      this.guitaristPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.vocalist!.actions.easeTo(
      this.vocalistPos.x,
      this.vocalistPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.bassist!.actions.easeTo(
      this.bassistPos.x,
      this.bassistPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );

    Resources.FallSound.play();

    const swapToBandTimer = new Timer({
      interval: UNDERGROUND_CONFIG.fallDuration,
      fcn: () => this.swapToBand(),
      repeats: false,
    });
    this.add(swapToBandTimer);

    // damage the snek!!!
    const snek = new SnakeUnderAttack();
    snek.pos = this.engine.screenToWorldCoordinates(
      vec(this.engine.drawWidth * 0.75, 0)
    );
    this.add(snek);
  }

  swapToBand() {
    this.background.graphics.use("empty");

    this.remove(this.bassist!);
    this.remove(this.guitarist!);
    this.remove(this.vocalist!);
    this.remove(this.drummer!);

    this.drummer = new Actor({
      x: this.drummerPos.x,
      y: this.drummerPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });
    this.guitarist = new Actor({
      x: this.guitaristPos.x,
      y: this.guitaristPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });
    this.bassist = new Actor({
      x: this.bassistPos.x,
      y: this.bassistPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });
    this.vocalist = new Actor({
      x: this.vocalistPos.x,
      y: this.vocalistPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });

    const bandGridConfig = {
      rows: 1,
      columns: 3,
      spriteWidth: 32,
      spriteHeight: 40,
    };
    const drummerSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatDrummerPlaying,
      grid: { ...bandGridConfig, spriteWidth: 60 },
    });

    this.drummer.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        drummerSpritesheet,
        [0, 1, 2],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    const guitaristSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatGuitaristPlaying,
      grid: { ...bandGridConfig, spriteWidth: 40 },
    });

    this.guitarist.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        guitaristSpritesheet,
        [0, 1, 2],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    const bassistSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatBassistPlaying,
      grid: { ...bandGridConfig, spriteWidth: 32 },
    });
    this.bassist.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        bassistSpritesheet,
        [0, 1, 2],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    const vocalistSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatVocalistPlaying,
      grid: { ...bandGridConfig, spriteWidth: 40 },
    });
    this.vocalist.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        vocalistSpritesheet,
        [0, 1, 2],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    this.add(this.drummer);
    this.add(this.guitarist);
    this.add(this.bassist);
    this.add(this.vocalist);

    SoundManager.playSetMusic(this.state.Round);

    this.add(
      new Timer({
        fcn: () => this.digAndLeave(),
        interval: this.getSetDuration(),
        repeats: false,
      })
    );
  }

  digAndLeave() {
    if (this.state.GameWon) {
      this.gameOver?.updateEndScreen("The snake's face melted 🤘🤘🤘");
      this.gameOver?.show();
      return;
    }

    this.remove(this.bassist!);
    this.remove(this.guitarist!);
    this.remove(this.vocalist!);
    this.remove(this.drummer!);

    this.background.graphics.use("default");

    // tumble and merge back together to dig out of viewport
    this.drummer = new Actor({
      x: this.drummerPos.x,
      y: this.drummerPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.guitarist = new Actor({
      x: this.guitaristPos.x,
      y: this.guitaristPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.bassist = new Actor({
      x: this.bassistPos.x,
      y: this.bassistPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.vocalist = new Actor({
      x: this.vocalistPos.x,
      y: this.vocalistPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });

    this.drummer.graphics.add(Resources.MeerkatDrummerFrontFacing.toSprite());
    this.guitarist.graphics.add(
      Resources.MeerkatGuitaristFrontFacing.toSprite()
    );
    this.bassist.graphics.add(Resources.MeerkatBassistFrontFacing.toSprite());
    this.vocalist.graphics.add(Resources.MeerkatVocalistFrontFacing.toSprite());

    this.add(this.drummer);
    this.add(this.guitarist);
    this.add(this.bassist);
    this.add(this.vocalist);

    const endingPos = this.engine.screenToWorldCoordinates(
      vec(this.playerScreenPos.x, this.engine.drawHeight)
    );

    this.drummer.actions.easeTo(
      endingPos.x,
      endingPos.y,
      UNDERGROUND_CONFIG.leaveDuration,
      EasingFunctions.EaseOutCubic
    );
    this.guitarist.actions.easeTo(
      endingPos.x,
      endingPos.y,
      UNDERGROUND_CONFIG.leaveDuration,
      EasingFunctions.EaseOutCubic
    );
    this.bassist.actions.easeTo(
      endingPos.x,
      endingPos.y,
      UNDERGROUND_CONFIG.leaveDuration,
      EasingFunctions.EaseOutCubic
    );
    this.vocalist.actions.easeTo(
      endingPos.x,
      endingPos.y,
      UNDERGROUND_CONFIG.leaveDuration,
      EasingFunctions.EaseOutCubic
    );

    this.add(
      new Timer({
        fcn: () => this.engine.goToScene("main"),
        interval: UNDERGROUND_CONFIG.leaveDuration,
        repeats: false,
      })
    );
  }

  onDeactivate() {
    SoundManager.unmuteBackgroundMusic();
  }

  getSetDuration() {
    if (this.state.Round === 1) {
      return UNDERGROUND_CONFIG.setDuration;
    } else {
      return UNDERGROUND_CONFIG.setDurationAlt;
    }
  }
}

class SnakeUnderAttack extends Actor {
  onInitialize(engine: Engine) {
    const spritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.Snek,
      grid: {
        rows: 1,
        columns: 8,
        spriteHeight: 96,
        spriteWidth: 96,
      },
    });

    this.graphics.add(spritesheet.sprites[config.SnekBodyLength]);
    this.actions.easeTo(
      this.pos.x,
      this.pos.y + 200,
      UNDERGROUND_CONFIG.fallDuration
    );

    const snekBody: Actor[] = [];
    for (let i = 0; i < config.SnekBodyLength; i++) {
      const spawnPos = vec(this.pos.x - (i + 1) * config.TileWidth, this.pos.y);
      const bodySegment = new Actor({
        x: spawnPos.x,
        y: spawnPos.y,
        width: config.TileWidth,
        height: config.TileWidth,
      });
      bodySegment.graphics.add(
        "default",
        spritesheet.sprites[config.SnekBodyLength - (i + 1)]
      );

      const restingPos = vec(spawnPos.x, spawnPos.y + 200);
      bodySegment.actions
        .easeTo(restingPos.x, restingPos.y, UNDERGROUND_CONFIG.fallDuration)
        .asPromise()
        .then(() => {
          bodySegment.rx = Util.toRadians(
            Util.randomIntInRange(
              UNDERGROUND_CONFIG.snekBodyRotationInDegreesPerSecondMin,
              UNDERGROUND_CONFIG.snekBodyRotationInDegreesPerSecondMax
            )
          );
          bodySegment.actions
            .moveBy(-5, -5, UNDERGROUND_CONFIG.snekBodyMoveSpeed)
            .moveBy(10, 10, UNDERGROUND_CONFIG.snekBodyMoveSpeed)
            .moveBy(-5, -5, UNDERGROUND_CONFIG.snekBodyMoveSpeed)
            .moveTo(
              restingPos.x,
              restingPos.y,
              UNDERGROUND_CONFIG.snekBodyMoveSpeed
            )
            .repeatForever();
        });
      snekBody.push(bodySegment);
    }

    engine.currentScene.add(snekBody[0]);
    engine.currentScene.add(snekBody[2]);
    engine.currentScene.add(snekBody[4]);
    engine.currentScene.add(snekBody[6]);

    engine.currentScene.add(snekBody[1]);
    engine.currentScene.add(snekBody[3]);
    engine.currentScene.add(snekBody[5]);
    engine.currentScene.add(snekBody[7]);
  }
}
