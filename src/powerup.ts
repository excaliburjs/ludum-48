import { Timer, Scene, Actor, Engine, Vector, Graphics } from "excalibur";
import { Player } from "./player";
import config from "./config";


export abstract class Collectible {
    
    sprite!: Graphics.Sprite;
    
    constructor(sprite: Graphics.Sprite) {
       this.sprite = sprite
    }
}

export class PowerUp extends Collectible {

    constructor(
        sprite: Graphics.Sprite,
        private powerUpTimer: PowerUpTimer) {
        super(sprite);
    }

    apply() {
        this.powerUpTimer.addPowerUp();
    }
}

export class PowerUpTimer {
  private timer!: Timer;
  private _timeRemaining: number = 0;
  private _enabled = false;
  constructor(
    private scene: Scene,
    private onEnable: () => void,
    private onDisable: () => void,
    private durationSeconds: number
  ) {
    this.timer = new Timer({ interval: this.durationSeconds * 1000 });
    this.scene.addTimer(this.timer);
  }

  private disable() {
    this.onDisable();
    this._enabled = false;
  }

  enabled(): Boolean {
    return this._enabled;
  }
  // ensures that powerUp bonuses will stack.
  // i.e. if you have two seconds left and pick up another one,
  // you have seven seconds left.
  addPowerUp() {
    this.timer.pause();
    this.timer.reset();
    this._timeRemaining = this.timeRemaining() + this.durationSeconds;
    this.onEnable();
    this._enabled = true;
    this.timer.on(this.disable);
    this.timer.unpause();
  }

  timeRemaining(): number {
    let timeRemaining = this._timeRemaining - this.timer.getTimeRunning();
    return timeRemaining < 0 ? 0 : timeRemaining;
  }
}
