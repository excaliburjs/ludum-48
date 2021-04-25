import { Timer, Scene, Actor, Engine, Vector, Graphics } from "excalibur";
import { Player } from "./player";
import config from "./config";

export abstract class Collectible {
  sprite!: Graphics.Sprite;
  name!: string;

  constructor(sprite: Graphics.Sprite, name: string) {
    this.sprite = sprite;
    this.name = name;
  }
}

export class PowerUp extends Collectible {
  constructor(
    sprite: Graphics.Sprite,
    name: string,
    private powerUpTimer: PowerUpTimer
  ) {
    super(sprite, name);
  }

  apply() {
    this.powerUpTimer.addPowerUp();
  }
}

export class PowerUpTimer {
  private timer!: Timer;
  private _timeRemaining: number = 0;
  private _enabled = false;
  private _outerDisabled: () => void;
  constructor(
    private scene: Scene,
    private onEnable: () => void,
    private onDisable: () => void,
    private durationSeconds: number
  ) {
    this.timer = new Timer({ interval: this.durationSeconds * 1000 });
    this.scene.addTimer(this.timer);
    this._outerDisabled = this.disable.bind(this);
  }

  private disable() {
    this.onDisable();
    this._enabled = false;
    this.timer.off(this._outerDisabled);
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
    this.timer.on(this._outerDisabled);
    this.timer.unpause();
  }

  timeRemaining(): number {
    let timeRemaining = this._timeRemaining - this.timer.getTimeRunning();
    return timeRemaining < 0 ? 0 : timeRemaining;
  }
}
