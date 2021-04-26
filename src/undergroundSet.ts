import {
  Actor,
  Scene,
  Engine,
  vec,
  Vector,
  EasingFunctions,
  Util,
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

    const drummerPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.drummer
    );
    const guitaristPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.guitarist
    );
    const bassistPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.bassist
    );
    const vocalistPos = this.engine.screenToWorldCoordinates(
      BAND_POSITION_VECTORS.vocalist
    );

    this.drummerFalling!.actions.easeTo(
      drummerPos.x,
      drummerPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.guitaristFalling!.actions.easeTo(
      guitaristPos.x,
      guitaristPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.vocalistFalling!.actions.easeTo(
      vocalistPos.x,
      vocalistPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
    this.bassistFalling!.actions.easeTo(
      bassistPos.x,
      bassistPos.y,
      UNDERGROUND_CONFIG.fallDuration,
      EasingFunctions.EaseInCubic
    );
  }

  onDeactivate() {}
}
