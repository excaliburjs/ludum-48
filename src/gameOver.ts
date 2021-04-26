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
  ScreenElement,
} from "excalibur";
import { DialogCard } from "./dialogueCard";
import config from "./config";
import { Resources } from "./resources";
import { Level } from "./level";
import { Button } from "./button";
import { Game } from ".";
import { GlobalState } from "./globalState";
export class GameOver extends ScreenElement {
  private card!: DialogCard;
  private backShadow!: Graphics.Rectangle;
  private backShadowLayer!: Graphics.GraphicsLayer;
  private button!: Button;
  private state: GlobalState = GlobalState.GetInstance();

  constructor(public gameWidth: number, public gameHeight: number) {
    super(gameWidth / 2, gameHeight / 2, 0, 0);
    this.transform.coordPlane = CoordPlane.Screen;
    this.traits = this.traits.filter(
      (t) => !(t instanceof Traits.TileMapCollisionDetection)
    );
    this.anchor = vec(0.5, 0.5);
  }

  onInitialize(engine: Engine) {
    this.backShadow = new Graphics.Rectangle({
      width: this.gameWidth * 2,
      height: this.gameHeight * 2,
      color: Color.fromRGB(51, 51, 51, 0.5),
    });
    this.graphics.anchor = vec(0.5, 0.5);
    this.backShadowLayer = this.graphics.layers.create({
      name: "backshadow",
      order: 1,
      // offset: vec(-this.width/2, -this.gameHeight/2),
    });
  }

  public updateEndScreen(text: string) {
    const cardPos = vec(this.pos.x, this.pos.y);

    this.card = new DialogCard([text], {
      pos: cardPos,
      topPadding: 30,
    });
    this.card.transform.coordPlane = CoordPlane.Screen;
    this.scene.add(this.card);
    this.card.z = 100;
    this.z = 100;

    this.button = new Button("Play Again?", {
      pos: cardPos,
      width: 200,
      height: 100,
    });
    this.button.transform.coordPlane = CoordPlane.Screen;
    this.button.on("pointerup", () => {
      if (this.button.isKilled()) return;
      this.state.newGameFun();
    });
    this.scene.add(this.button);
    this.button.z = 101;
  }

  show() {
    this.backShadowLayer.show(this.backShadow);
    this.card.actions.easeTo(
      this.gameWidth / 2,
      this.gameHeight / 3,
      500,
      EasingFunctions.EaseInOutCubic
    );
    this.button.actions.easeTo(
      this.gameWidth / 2,
      this.gameHeight / 3 + 125,
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
    this.button.actions.easeTo(
      this.gameWidth / 2,
      this.gameHeight * 2,
      500,
      EasingFunctions.EaseInOutCubic
    );
  }
}
