import {
  Actor,
  CollisionType,
  Color,
  EasingFunctions,
  Engine,
  Graphics,
  vec,
  ExitTriggerEvent,
  Traits,
  CoordPlane,
  Vector,
} from "excalibur";
import { DialogCard } from "./dialogueCard";
import config from "./config";
import { Resources } from "./resources";
import { Level } from "./level";
export class GameOver extends Actor {
  private card!: DialogCard;
  private backShadow!: Graphics.Rectangle;
  private backShadowLayer!: Graphics.GraphicsLayer;

  constructor(public gameWidth: number, public gameHeight: number) {
    super(gameWidth / 2, gameHeight / 2, 600, 600);
    this.transform.coordPlane = CoordPlane.Screen;
    this.traits = this.traits.filter(
      (t) => !(t instanceof Traits.TileMapCollisionDetection)
    );
  }

  onInitialize(engine: Engine) {
    this.backShadow = new Graphics.Rectangle({
      width: this.gameWidth * 2,
      height: this.gameHeight * 2,
      color: Color.fromRGB(51, 51, 51, 0.5),
    });
    this.backShadowLayer = this.graphics.layers.create({
      name: "backshadow",
      order: 1,
    });
  }

  public updateEndScreen() {
    const cardPos = vec(this.pos.x, this.pos.y);
    let text = "Press 'R' to reset.";
    this.card = new DialogCard([text], {
      pos: cardPos,
      topPadding: 30,
    });
    this.card.transform.coordPlane = CoordPlane.Screen;
    this.scene.add(this.card);
    this.card.z = 100;
    this.z = 100;
  }

  show() {
    this.backShadowLayer.show(this.backShadow);
    this.card.actions.easeTo(
      this.gameWidth / 2,
      this.gameHeight / 3,
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
