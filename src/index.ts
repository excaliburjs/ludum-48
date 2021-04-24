import "regenerator-runtime/runtime"; // needed for async/await with parcel

import { DisplayMode, Engine, Flags, Loader } from "excalibur";
import { Player } from "./player";
import { Resources } from "./resources";
import { Level } from "./level";
import config from "./config";

Flags.enable("use-webgl");
class Game extends Engine {
  constructor() {
    super({
      canvasElementId: "game",
      width: config.TileWidth * config.ChunkWidth,
      height: config.TileWidth * config.ChunkHeight,
      displayMode: DisplayMode.Fit,
    });
  }
  initialize() {
    // const player = new Player();
    // this.add(player);

    const loader = new Loader();
    for (const resource of Object.values(Resources)) {
      loader.addResource(resource);
    }

    const level = new Level();
    this.addScene("main", level);
    this.goToScene("main");

    this.start(loader);
  }
}

export const game = new Game();

game.initialize();