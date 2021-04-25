import config from "./config";
import { Graphics, ScreenElement, Util, vec } from "excalibur";
import { Resources } from "./resources";

export class ProgressMeter extends ScreenElement {
  totalDistance = config.DistanceToComplete; // tiles
  progress = 0; // tiles;
  meterStart!: Graphics.Sprite;
  meterFill!: Graphics.Sprite;
  meterFillCap!: Graphics.Sprite;
  meterEmpty!: Graphics.Sprite;
  meterEnd!: Graphics.Sprite;
  meterEndFill!: Graphics.Sprite;

  spriteFont!: Graphics.SpriteFont;
  text!: Graphics.Text;
  avatar!: Graphics.Sprite;

  constructor() {
    super({
      pos: vec(24, 48),
    });
    this.z = 100;
  }

  onInitialize() {
    this.avatar = Resources.Avatar.toSprite();
    const spriteSheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.ProgressMeter,
      grid: {
        spriteHeight: 8,
        spriteWidth: 32,
        rows: 8,
        columns: 1,
      },
    });

    const spriteFontSheet = Graphics.SpriteSheet.fromGrid({
      image: Resources.SpriteFont,
      grid: {
        spriteWidth: 16,
        spriteHeight: 16,
        rows: 3,
        columns: 16,
      },
    });

    this.spriteFont = new Graphics.SpriteFont({
      spriteSheet: spriteFontSheet,
      alphabet: "0123456789abcdefghijklmnopqrstuvwxyz,!'&.\"?- ",
      caseInsensitive: true,
      spacing: -8,
    });

    this.text = new Graphics.Text({
      text: ((this.progress / this.totalDistance) * 100).toFixed(1) + "M",
      font: this.spriteFont,
    });
    // this.text.rotation = Math.PI/2;
    this.text.scale = vec(1.5, 1.5);

    this.meterStart = spriteSheet.sprites[0];
    this.meterFill = spriteSheet.sprites[1];
    this.meterFillCap = spriteSheet.sprites[2];
    this.meterEmpty = spriteSheet.sprites[3];
    this.meterEndFill = spriteSheet.sprites[6];
    this.meterEnd = spriteSheet.sprites[7];

    this.buildMeterGraphics();
  }

  updateProgress(currentProgress: number) {
    this.progress = Util.clamp(currentProgress, 0, this.totalDistance);
    this.text.text =
      ((this.progress / this.totalDistance) * 100).toFixed(1) + "M";
  }

  onPreUpdate() {
    this.buildMeterGraphics();
  }

  buildMeterGraphics() {
    let tileHeight = 8; // pixels
    let totalTiles = config.MeterTilesHigh;

    // init
    let currentTile = 0;
    this.graphics.hide();

    // Show avatar portrait
    this.graphics.show(this.avatar, {
      offset: vec(48 + tileHeight, tileHeight * 4),
    });

    // Show sprite font text
    this.graphics.show(
      this.text,
      { offset: vec(5, -32) }
      // { offset: vec(-112, 90) }
    );

    // Show start cap
    this.graphics.show(this.meterStart, {
      offset: vec(0, tileHeight * currentTile++),
    });

    // Show progress fill
    let progressTiles = Math.floor(
      (this.progress / this.totalDistance) * totalTiles
    ); // total tiles high
    let complete = progressTiles === totalTiles; // total tiles

    for (let i = 0; i < progressTiles; i++) {
      this.graphics.show(this.meterFill, {
        offset: vec(0, tileHeight * currentTile++),
      });
    }

    // Show progress fill cap if not complete
    if (!complete) {
      this.graphics.show(this.meterFillCap, {
        offset: vec(0, tileHeight * currentTile++),
      });

      // Show empty portion of the meter
      const emptyTiles = totalTiles - currentTile - 1; // -1 for endcap
      for (let i = 0; i < emptyTiles; i++) {
        this.graphics.show(this.meterEmpty, {
          offset: vec(0, tileHeight * currentTile++),
        });
      }
    }

    // Show endcap
    this.graphics.show(complete ? this.meterEndFill : this.meterEnd, {
      offset: vec(0, tileHeight * currentTile++),
    });
  }
}
