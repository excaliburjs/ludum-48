import {
  Actor,
  ActorArgs,
  Graphics,
  vec,
  Color,
  ExitTriggerEvent,
  ScreenElement,
  Vector,
} from "excalibur";
import { Resources } from "./resources";

export class Button extends ScreenElement {
  constructor(private text: string, options: ActorArgs) {
    super({ ...options });
  }

  onInitialize() {
    const group = new Graphics.GraphicsGroup({
      members: [
        {
          graphic: Graphics.Sprite.from(Resources.PlayAgainButton),
          pos: vec(0, 0),
        },
      ],
    });
    group.width = this.width;
    group.height = this.height;
    this.body.useBoxCollider(
      Resources.PlayAgainButton.width,
      Resources.PlayAgainButton.height,
      Vector.Half
    );
    this.graphics.add(group);
  }
}
