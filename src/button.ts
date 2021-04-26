import { Actor, ActorArgs, Graphics, vec, Color, ExitTriggerEvent, ScreenElement } from "excalibur";
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
                    pos: vec(-this.width/2,-this.height / 2),
                },
            ],
        });
        group.width = this.width;
        group.height = this.height;
        this.graphics.add(group);
    }
}
