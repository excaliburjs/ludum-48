import { Actor, Color, EasingFunctions, Engine, vec, Vector } from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";

export class Snek extends Actor {
    private playerTrail: PlayerTrail = PlayerTrail.GetInstance();
    private timer: number = 0;

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
        this.timer += _delta;
        if (this.timer >= config.SnekAdvanceTimer) {
            this.timer -= config.SnekAdvanceTimer;
            this.moveSnek(this.playerTrail.pop()?.value ?? this.pos);
        }
        if (this.vel.size !== 0) {
            this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
        }
    }

    moveSnek(worldPos: Vector) {
        const tileX = Math.floor(worldPos.x / config.TileWidth);
        const tileY = Math.floor(worldPos.y / config.TileWidth);
        this.actions.easeTo(
            tileX * config.TileWidth + config.TileWidth / 2,
            tileY * config.TileWidth + config.TileWidth / 2,
            500,
            EasingFunctions.EaseInOutCubic
        );
    }
}
