import { Actor, Engine, vec, Vector } from "excalibur";
import { Resources } from "./resources";
import config from "./config";

const BAND_POSITION_VECTORS = {
  drummer: vec(224, 662),
  guitarist: vec(132, 687),
  bassist: vec(478, 714),
  vocalist: vec(321, 710),
};

export class UndergroundSet extends Actor {
  private drummerFalling: Actor | undefined;
  private guitaristFalling: Actor | undefined;
  private bassistFalling: Actor | undefined;
  private vocalistFalling: Actor | undefined;

  constructor(private playerPos: Vector) {
    super();
  }

  onInitialize(engine: Engine) {
    this.width = engine.drawWidth;
    this.height = engine.drawHeight;

    this.graphics.add(Resources.UndergroundSet.toSprite());

    this.drummerFalling = new Actor({
      x: this.playerPos.x,
      y: this.playerPos.y,
    });
    this.guitaristFalling = new Actor({
      x: this.playerPos.x,
      y: this.playerPos.y,
    });
    this.bassistFalling = new Actor({
      x: this.playerPos.x,
      y: this.playerPos.y,
    });
    this.vocalistFalling = new Actor({
      x: this.playerPos.x,
      y: this.playerPos.y,
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
  startSequence() {}

  stopSequence() {}
}
