import { Actor, Color, EasingFunctions, Engine, vec, Vector } from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";
import { Every } from "./every";
export class Snek extends Actor {
    private playerTrail: PlayerTrail = PlayerTrail.GetInstance();
    private currentSnekAdvance: number = config.SnekAdvanceTimer;
    private calculatedSnekSpeed: number = config.SnekAdvanceTimer;
    private timer: number = 0;
    private moving: Boolean = false;
    private snekSpeedUpdater: Every.Second = new Every.Second(() => this.updateSnekSpeed, 1);

    constructor(public level: Level) {
        super({
            pos: vec(
                config.TileWidth * 5 - config.TileWidth / 2,
                config.TileWidth * 5 - config.TileWidth / 2
            ),
            width: config.TileWidth,
            height: config.TileWidth,
        });
        this.z = 11;
    }

    onInitialize(engine: Engine) {
        this.graphics.add(Resources.Sword.toSprite());
    }


    onPreUpdate(_engine: Engine, _delta: number): void {
        this.timer += _delta / 1000;
        if (this.timer >= this.currentSnekAdvance) {
            this.timer = 0;
            this.moveSnek();
        }
        this.snekSpeedUpdater.Update(_delta);
        if (this.vel.size !== 0) {
            this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
        }
    }

    updateSnekSpeed() {
        this.calculatedSnekSpeed -= config.SnekAcceleration
        const playerPos = this.playerTrail.peekLast();
        if (!!playerPos) {
            const distX = Math.abs(playerPos.x - this.pos.x);
            const distY = Math.abs(playerPos.y - this.pos.y);
            const distance = Math.sqrt(distX * distX + distY * distY)
            if (distance >= config.SnekDistanceBeforeCatchUp) {
                this.currentSnekAdvance = Math.min(config.SnekCatchUpAcceleration, this.calculatedSnekSpeed);
            }
        }
    }

    moveSnek() {
        if (this.moving) {
            return;
        }
        const place = this.playerTrail.dequeue();
        if (!place) {
            return;
        }
        this.moving = true;
        const tileX = Math.floor(place.x / config.TileWidth);
        const tileY = Math.floor(place.y / config.TileWidth);

        this.actions.easeTo(
            tileX * config.TileWidth + config.TileWidth / 2,
            tileY * config.TileWidth + config.TileWidth / 2,
            500,
            EasingFunctions.EaseInOutCubic
        ).callMethod(() => { this.moving = false; });
    }
}
