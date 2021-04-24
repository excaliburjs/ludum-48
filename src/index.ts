import "regenerator-runtime/runtime"; // needed for async/await with parcel

import {
  DisplayMode,
  Engine,
  Flags,
  Loader,
  Input,
  PostUpdateEvent,
  Physics,
} from "excalibur";
import dat from "dat.gui";

import { Resources } from "./resources";
import { Level } from "./level";
import config from "./config";
Physics.enabled = false;

const gui = new dat.GUI({ name: "Ludum 48 Debug" });
for (let key in config as any) {
  if (typeof (config as any)[key] === "number") {
    switch (key) {
      default: {
        gui.add(
          config as any,
          key,
          0,
          (config as any)[key] * 10,
          ((config as any)[key] * 10) / 20
        );
      }
    }
  }
}

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
    this.start(loader).then(() => {
      Resources.BackgroundMusic.play();
    });
  }
}

export const game = new Game();

game.initialize();
