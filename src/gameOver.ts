import {
  Actor,
  CollisionType,
  Color,
  EasingFunctions,
  Engine,
  Graphics,
  vec,
  ExitTriggerEvent,
} from "excalibur";
import { DialogCard } from "./dialogueCard";
import config from "./config";
import { Resources } from "./resources";
import { Level } from "./level";
import { GraphicsComponent } from "../lib/excalibur/build/dist/Graphics";
export class GameOver extends Actor {
  private card!: DialogCard;
  private backShadow!: Graphics.Rectangle;
  private backShadowLayer!: Graphics.GraphicsLayer;
  
  constructor(public gameWidth: number, public gameHeight: number) {
    super(gameWidth / 2, gameHeight / 2, 600, 600);
  }

  onInitialize(engine: Engine) {
    this.backShadow = new Graphics.Rectangle({
      width: this.gameWidth * 2,
      height: this.gameHeight * 2,
      color: Color.fromRGB(51, 51, 51, 0.5),
    });
    this.backShadowLayer = this.graphics.layers.create({
      name: "backshadow",
      order: 1
    });
  }

  public updateEndScreen() {
    const cardPos = vec(this.pos.x, this.pos.y);
    let text = "The audience was not impressed";
    this.card = new DialogCard([text], {
      pos: cardPos,
      topPadding: 30,
    });
    this.scene.add(this.card);
    this.card.z = 100;
    this.z = 100;
  }

  show() {
    this.backShadowLayer.show(this.backShadow);
    this.pos = vec(0, 0);
    this.card.actions.easeTo(
      this.gameWidth / 2,
      this.gameHeight / 4,
      500,
      EasingFunctions.EaseInOutCubic
    );
  }

  hide() {
    this.backShadowLayer.hide();
    this.card.actions.easeTo(
      this.gameWidth / 2,
      this.gameHeight * 2,
      500,
      EasingFunctions.EaseInOutCubic
    );
  }
}