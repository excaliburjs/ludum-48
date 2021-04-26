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
} from "excalibur";
import { Resources } from "./resources";

const BAND_POSITION_VECTORS = {
  drummer: vec(285, 617),
  guitarist: vec(162, 687),
  bassist: vec(523, 689),
  vocalist: vec(336, 685),
};

const UNDERGROUND_CONFIG = {
  fallDuration: 2000,
  fallRotationInDegreesPerSecond: 120,
  setDuration: 5000,
  leaveDuration: 1500,
};

export class UndergroundSet extends Scene {
  private drummer: Actor | undefined;
  private guitarist: Actor | undefined;
  private bassist: Actor | undefined;
  private vocalist: Actor | undefined;

  private drummerPos!: Vector;
  private guitaristPos!: Vector;
  private vocalistPos!: Vector;
  private bassistPos!: Vector;

  constructor(private playerScreenPos: Vector) {
    super();
  }

  onInitialize(engine: Engine) {
    this.camera.pos = vec(0, 0);
    const background = new Actor({
      x: 0,
      y: 0,
      width: engine.drawWidth,
      height: engine.drawHeight,
      anchor: vec(0, 0),
    });
    background.graphics.add(Resources.UndergroundSet.toSprite());
    this.add(background);

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

    const swapToBandTimer = new Timer({
      interval: UNDERGROUND_CONFIG.fallDuration,
      fcn: () => this.swapToBand(),
      repeats: false,
    });
    this.add(swapToBandTimer);
  }

  swapToBand() {
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

    this.add(
      new Timer({
        fcn: () => this.digAndLeave(),
        interval: UNDERGROUND_CONFIG.setDuration,
        repeats: false,
      })
    );
  }

  digAndLeave() {
    this.remove(this.bassist!);
    this.remove(this.guitarist!);
    this.remove(this.vocalist!);
    this.remove(this.drummer!);

    // tumble and merge back together to dig out of viewport

    this.add(
      new Timer({
        fcn: () => this.engine.goToScene("main"),
        interval: UNDERGROUND_CONFIG.leaveDuration,
        repeats: false,
      })
    );
  }

  onDeactivate() {}
}
