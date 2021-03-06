import "regenerator-runtime/runtime"; // needed for async/await with parcel

import {
  DisplayMode,
  Engine,
  Flags,
  Loader,
  Input,
  PostUpdateEvent,
  Physics,
  Vector,
} from "excalibur";
import dat from "dat.gui";

import { Resources } from "./resources";
import { Level } from "./level";
import config from "./config";
import { GlobalState } from "./globalState";
import { PlayerTrail } from "./playerTrail";
import { loadPreferences } from "./preferences";
import { SoundManager } from "./sound-manager";
Physics.enabled = false;

const debugMenu = config.DebugMenuEnabled;

if (debugMenu) {
  const gui = new dat.GUI({ name: "Ludum 48 Debug" });
  for (let key in config as any) {
    if (typeof (config as any)[key] === "number") {
      switch (key) {
        case "DigTime":
        case "SpaceMoveDuration":
        case "SnakeMoveDuration":
          gui.add(config, key, 0, config[key] * 10, 50);
          break;
        case "SnekMinSecondsPerSquare":
        case "SnekCatchUpSecondsPerSquare":
          // tenth
          gui.add(config, key, 0, config[key] * 10, 1 / 10);
          break;
        case "SnekSquaresDistanceBeforeCatchUpSpeed":
          // ones
          gui.add(config, key, 0, config[key] * 10, 1);
          break;
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
}

loadPreferences();
SoundManager.init();

Flags.enable("use-webgl");
export class Game extends Engine {
  private state: GlobalState = GlobalState.GetInstance();
  private trail: PlayerTrail = PlayerTrail.GetInstance();
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
    this.start(loader).then(() => {
      Resources.BackgroundMusic.play();
    });
    this.state.newGameFun = this.NewGame.bind(this);
    this.state.newGameFun();

    this.input.keyboard.on("press", (e) => {
      if (e.key === Input.Keys.Semicolon && debugMenu) {
        this.toggleDebug();
      }
    });

    this.input.keyboard.on("press", (e) => {
      if (this.state.RoundWon) return;

      if (this.state.GameOver) {
        if (e.key === Input.Keys.R) {
          this.state.newGameFun();
        }
      }
    });

    this.input.pointers.primary.on("up", (e) => {
      if (this.state.GameOver) {
        this.state.newGameFun();
      }
    });
  }

  NewGame(): void {
    for (let sceneKey in this.scenes) {
      for (let actor of this.scenes[sceneKey].actors) {
        actor.kill();
      }
      this.removeScene(sceneKey);
    }

    this.state.GameOver = false;
    this.state.Round = 1;
    this.state.RoundWon = false;
    this.state.GameWon = false;

    const startY = config.TileWidth * 5 - config.TileWidth / 2;
    this.trail.clear();
    this.trail.enqueue(new Vector(1 * config.TileWidth, startY));
    this.trail.enqueue(new Vector(2 * config.TileWidth, startY));
    this.trail.enqueue(new Vector(3 * config.TileWidth, startY));
    this.trail.enqueue(new Vector(4 * config.TileWidth, startY));

    const level = new Level();
    this.addScene("main", level);
    this.goToScene("main");
  }
}

export const game = new Game();

game.initialize();
