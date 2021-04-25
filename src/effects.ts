import {
  Cell,
  ParticleEmitter,
  Graphics,
  Engine,
  Vector,
  Color,
} from "excalibur";
import config from "./config";

export function digEffect(engine: Engine, tile: Cell, sprite: Graphics.Sprite) {
  var emitter = new ParticleEmitter(
    tile.bounds.center.x,
    tile.bounds.center.y,
    1,
    1
  );
  emitter.minVel = 30;
  emitter.maxVel = 125;
  emitter.minAngle = Math.PI / 4;
  emitter.maxAngle = (Math.PI * 3) / 4;
  emitter.isEmitting = false;
  emitter.emitRate = 5;
  emitter.opacity = 0.5;
  emitter.fadeFlag = true;
  emitter.particleLife = 1000;
  emitter.maxSize = 0.4;
  emitter.minSize = 0.2;
  emitter.acceleration = new Vector(0, 500);
  emitter.beginColor = Color.Red;
  emitter.endColor = Color.Yellow;
  emitter.startSize = 0.5;
  emitter.endSize = 0.01;
  emitter.particleSprite = Graphics.Sprite.toLegacySprite(sprite);
  emitter.particleRotationalVelocity = Math.PI / 10;
  emitter.randomRotation = true;
  emitter.fadeFlag = true;
  emitter.focus = new Vector(0, emitter.pos.y + 1000); // relative to the emitter
  emitter.focusAccel = 900;

  engine.add(emitter);

  emitter.emitParticles(5);
  emitter.actions.moveTo(emitter.pos.x + 3, emitter.pos.y + 1, 1).die();
}
