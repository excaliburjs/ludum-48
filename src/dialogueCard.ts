import { Actor, ActorArgs, Graphics, vec, Color } from "excalibur";
import { Resources } from "./resources";

export interface DialogCardOptions {
  topPadding?: number
}
export class DialogCard extends Actor {
  private topPadding: number;

  constructor(private text: string[], options: ActorArgs & DialogCardOptions) {
    super({ ...options, width: 837, height: 480 });
    this.topPadding = options.topPadding || 0;
  }

  onInitialize() {
    let graphicsMember: Graphics.GraphicsGrouping[] = [];
    graphicsMember.push({
      graphic: Graphics.Sprite.from(Resources.Modal),
      pos: vec(0, 0)
    });
    for (let index = 0; index < this.text.length; index++) {
      graphicsMember.push({
        graphic: new Graphics.Text({
          text: this.text[index],
          color: Color.White,
          font: new Graphics.Font({
            family: "Century, Georgia, serif",
            size: 36,
            textAlign: Graphics.TextAlign.Center,
          }),
        } as any),
        pos: vec(
          this.width / 2,
          this.height * ((index + 1) / (this.text.length + 1)) + this.topPadding
        ),
      });
    }
    const group = new Graphics.GraphicsGroup({
      members: graphicsMember,
    });
    group.width = this.width;
    group.height = this.height;
    this.graphics.add(group);
  }
}