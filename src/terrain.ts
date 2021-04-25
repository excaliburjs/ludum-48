import { Cell, Engine, Graphics, Sound, TileMap } from "excalibur";
import { ImageSource } from "../lib/excalibur/build/dist/Graphics";
import { Resources } from "./resources";
import config from "./config";

interface ITerrain {
  mineable(): Boolean;
  tag(): string;
  delay(): number;

  playSound(): void;
  sprite(): Graphics.Sprite | null;
}

export class Terrain implements ITerrain {
  constructor(
    tag: string,
    mineable: Boolean,
    delay: () => number,
    spriteImage: ImageSource | null,
    digSound: Sound | null
  ) {
    this.actorTag = tag;
    this.isMineable = mineable;
    this.mineDelay = delay;
    this.spriteImage = spriteImage;
    this.digSound = digSound;
    this.blockSprite = null;
  }

  private actorTag: string;
  private isMineable: Boolean;
  private mineDelay: () => number;
  private digSound: Sound | null;
  private spriteImage: ImageSource | null;
  private blockSprite: Graphics.Sprite | null;

  playSound() {
    this.digSound?.play();
  }

  tag(): string {
    return this.actorTag;
  }
  mineable(): Boolean {
    return this.isMineable;
  }
  delay(): number {
    return this.mineDelay();
  }
  sprite(): Graphics.Sprite | null {
    if (this.blockSprite) return this.blockSprite;
    if (this.spriteImage) {
      this.blockSprite = this.spriteImage.toSprite();
    }
    return this.blockSprite;
  }

  static GetTerrain(cell: Cell): Terrain {
    if (cell.hasTag(EmptyTag)) return EmptyTerrain;
    else if (cell.hasTag(RockTag)) return RockTerrain;
    else if (cell.hasTag(DirtTag)) return DirtTerrain;
    else return EmptyTerrain;
  }

  static Initialize() {
    EmptyTerrain = new Terrain(EmptyTag, true, () => 0, null, null);
    RockTerrain = new Terrain(
      RockTag,
      false,
      () => config.RockDigDelay,
      Resources.Rock,
      Resources.ClankSound
    );
    DirtTerrain = new Terrain(
      DirtTag,
      true,
      () => config.DigTime,
      Resources.Dirt,
      Resources.DigSound
    );
  }
}

export const RockTag = "rock";
export const DirtTag = "dirt";
export const EmptyTag = "empty";

export var EmptyTerrain: Terrain;
export var RockTerrain: Terrain;
export var DirtTerrain: Terrain;
