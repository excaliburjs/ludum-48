import { Actor, Color, EasingFunctions, Engine, vec, Vector } from "excalibur";
import { Level } from "./level";
import { Resources } from "./resources";
import config from "./config";
import { PlayerTrail } from "./playerTrail";

export class Snek extends Actor {
    private playerTrail: PlayerTrail = PlayerTrail.GetInstance();

    constructor(public level: Level) {
        super({
            pos: vec(
                config.TileWidth * 5 - config.TileWidth / 2,
                config.TileWidth * 5 - config.TileWidth / 2
            ),
            width: config.TileWidth,
            height: config.TileWidth,
        });

    }

    onInitialize(engine: Engine) {
        this.graphics.add(Resources.Sword.toSprite());
    }

    onPreUpdate() {
        if (this.vel.size !== 0) {
            this.rotation = Math.atan2(this.vel.y, this.vel.x) + Math.PI / 4;
        }
    }
}
