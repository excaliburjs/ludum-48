import "regenerator-runtime/runtime"; // needed for async/await with parcel

import {
  DisplayMode,
  Engine,
  Flags,
  Loader,
  Input,
  PostUpdateEvent,
} from "excalibur";
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
      height: config.TileWidth * (config.ChunkWidth * config.InvAspectRatio),
      displayMode: DisplayMode.Fit,
      pointerScope: Input.PointerScope.Canvas,
    });
  }
  initialize() {
    const loader = new Loader();
    for (const resource of Object.values(Resources)) {
      loader.addResource(resource);
    }

    const level = new Level();
    this.addScene("main", level);
    this.goToScene("main");

    game.input.keyboard.on("press", (e) => {
      if (e.key === Input.Keys.Semicolon) {
        this.toggleDebug();
      }
    });

    this.start(loader);
  }
}

export const game = new Game();

game.initialize();
