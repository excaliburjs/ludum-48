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
};

export class UndergroundSet extends Scene {
  private drummerFalling: Actor | undefined;
  private guitaristFalling: Actor | undefined;
  private bassistFalling: Actor | undefined;
  private vocalistFalling: Actor | undefined;

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

    this.drummerFalling = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.guitaristFalling = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.bassistFalling = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });
    this.vocalistFalling = new Actor({
      x: spawnPos.x,
      y: spawnPos.y,
      scale: vec(2, 2),
      width: 20,
      height: 40,
    });

    this.drummerFalling.graphics.add(
      Resources.MeerkatDrummerFrontFacing.toSprite()
    );
    this.guitaristFalling.graphics.add(
      Resources.MeerkatGuitaristFrontFacing.toSprite()
    );
    this.bassistFalling.graphics.add(
      Resources.MeerkatBassistFrontFacing.toSprite()
    );
    this.vocalistFalling.graphics.add(
      Resources.MeerkatVocalistFrontFacing.toSprite()
    );

    this.add(this.drummerFalling);
    this.add(this.guitaristFalling);
    this.add(this.bassistFalling);
    this.add(this.vocalistFalling);

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
    this.drummerFalling!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );
    this.guitaristFalling!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );
    this.vocalistFalling!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );
    this.bassistFalling!.rx = Util.toRadians(
      UNDERGROUND_CONFIG.fallRotationInDegreesPerSecond
    );

    this.drummerFalling!.actions.easeTo(
      this.drummerPos.x,
      this.drummerPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.guitaristFalling!.actions.easeTo(
      this.guitaristPos.x,
      this.guitaristPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.vocalistFalling!.actions.easeTo(
      this.vocalistPos.x,
      this.vocalistPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.bassistFalling!.actions.easeTo(
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
    this.remove(this.bassistFalling!);
    this.remove(this.guitaristFalling!);
    this.remove(this.vocalistFalling!);
    this.remove(this.drummerFalling!);

    const drummerPlaying = new Actor({
      x: this.drummerPos.x,
      y: this.drummerPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });
    const guitaristPlaying = new Actor({
      x: this.guitaristPos.x,
      y: this.guitaristPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });
    const bassistPlaying = new Actor({
      x: this.bassistPos.x,
      y: this.bassistPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });
    const vocalistPlaying = new Actor({
      x: this.vocalistPos.x,
      y: this.vocalistPos.y,
      width: 60,
      height: 40,
      scale: vec(2, 2),
    });

    const bandGridConfig = {
      rows: 1,
      columns: 3,
      spriteWidth: 60,
      spriteHeight: 40,
    };
    const drummerSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatDrummerPlaying,
      grid: bandGridConfig,
    });

    drummerPlaying.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        drummerSpritesheet,
        [0],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    const guitaristSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatGuitaristPlaying,
      grid: bandGridConfig,
    });

    guitaristPlaying.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        guitaristSpritesheet,
        [0],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    const bassistSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatBassistPlaying,
      grid: bandGridConfig,
    });
    bassistPlaying.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        bassistSpritesheet,
        [0],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    const vocalistSpritesheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.MeerkatVocalistPlaying,
      grid: bandGridConfig,
    });
    vocalistPlaying.graphics.use(
      Graphics.Animation.fromSpriteSheet(
        vocalistSpritesheet,
        [0],
        100,
        Graphics.AnimationStrategy.PingPong
      )
    );

    this.add(drummerPlaying);
    this.add(guitaristPlaying);
    this.add(bassistPlaying);
    this.add(vocalistPlaying);
  }

  onDeactivate() {}
}
