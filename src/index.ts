import "regenerator-runtime/runtime"; // needed for async/await with parcel

import { DisplayMode, Engine, Flags, Loader } from "excalibur";
import { Player } from "./player";
import { Resources } from "./resources";

Flags.enable("use-webgl");
class Game extends Engine {
  constructor() {
    super({
      canvasElementId: "game",
      width: 900,
      height: 1600,
      displayMode: DisplayMode.Fit,
    });
  }
  initialize() {
    const player = new Player();
    this.add(player);

    const loader = new Loader();
    loader.addResource(Resources.Sword);
    this.start(loader);
  }
}

export const game = new Game();

game.initialize();
