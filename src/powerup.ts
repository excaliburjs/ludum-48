import { Timer, Scene } from "excalibur";
import { Player } from "./player";

export class PowerUp {
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
    this._timeRemaining += this.durationSeconds;
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
