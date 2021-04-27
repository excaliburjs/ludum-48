import {
  EasingFunctions,
  Engine,
  Graphics,
  ScreenElement,
  vec,
} from "excalibur";
import { Resources } from "./resources";

export class Title extends ScreenElement {
  constructor() {
    super({
      pos: vec(0, 0),
      width: 100,
      height: 100,
    });
  }
  sprite!: Graphics.Sprite;
  engine!: Engine;
  onInitialize(engine: Engine) {
    this.engine = engine;
    this.sprite = Resources.Title.toSprite();
    this.sprite.scale = vec(0.5, 0.5);
    this.graphics.use(this.sprite);
    this.pos.x = this.engine.halfDrawWidth;
    this.pos.y = this.engine.halfDrawHeight - 50;
  }

  show() {
    this.actions.delay(700);

    this.actions.easeTo(
      this.engine.halfCanvasWidth + 500,
      this.engine.halfDrawHeight - 50,
      700,
      EasingFunctions.EaseInOutCubic
    );

    this.actions.callMethod(() => {
      this.pos.x = this.engine.halfDrawWidth - 500;
    });
  }
}
