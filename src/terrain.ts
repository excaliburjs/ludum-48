import { Cell, Engine, Graphics, Sound, TileMap } from "excalibur";
import { ImageSource } from "../lib/excalibur/build/dist/Graphics";
import { Resources } from "./resources";
import config from "./config";
import { toRadians } from "../lib/excalibur/build/dist/Util/Util";

interface ITerrain {
  mineable(): Boolean;
  tag(): string;
  delay(): number;

  playSound(): void;
  sprites(): Graphics.Sprite[] | null;
}

export class Terrain implements ITerrain {
  constructor(
    tag: string,
    mineable: Boolean,
    delay: () => number,
    spriteImages: ImageSource[] | null,
    digSound: Sound | null
  ) {
    this.actorTag = tag;
    this.isMineable = mineable;
    this.mineDelay = delay;
    this.spriteImages = spriteImages;
    this.digSound = digSound;
    this.blockSprites = null;
  }

  private actorTag: string;
  private isMineable: Boolean;
  private mineDelay: () => number;
  private digSound: Sound | null;
  protected spriteImages: ImageSource[] | null;
  protected blockSprites: Graphics.Sprite[] | null;

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
  sprites(): Graphics.Sprite[] | null {
    if (this.blockSprites) return this.blockSprites;
    if (this.spriteImages) {
      this.blockSprites = this.spriteImages.map((image) => image.toSprite());
    }
    return this.blockSprites;
  }

  static GetTerrain(cell: Cell | null): Terrain {
    if (!cell) return EmptyTerrain;
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
      [Resources.Rock],
      Resources.ClankSound
    );
    DirtTerrain = new Terrain(
      DirtTag,
      true,
      () => config.DigTime,
      [Resources.Dirt],
      Resources.DigSound
    );
  }
}

export interface TunnelSides {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export class TunnelTerrain extends Terrain {
  constructor(private sides: TunnelSides) {
    super(EmptyTag, true, () => 0, null, null);
  }

  sprites(): Graphics.Sprite[] | null {
    if (this.blockSprites) return this.blockSprites;

    this.blockSprites = [];

    if (this.sides.north) {
      const northEdge = Resources.DirtSide.toSprite();
      northEdge.rotation = toRadians(180);
      this.blockSprites.push(northEdge);
    }
    if (this.sides.east) {
      const eastEdge = Resources.DirtSide.toSprite();
      eastEdge.rotation = toRadians(-90);
      this.blockSprites.push(eastEdge);
    }
    if (this.sides.west) {
      const westEdge = Resources.DirtSide.toSprite();
      westEdge.rotation = toRadians(90);
      this.blockSprites.push(westEdge);
    }
    if (this.sides.south) {
      this.blockSprites.push(Resources.DirtSide.toSprite());
    }

    return this.blockSprites;
  }
}

export const RockTag = "rock";
export const DirtTag = "dirt";
export const EmptyTag = "empty";

export var EmptyTerrain: Terrain;
export var RockTerrain: Terrain;
export var DirtTerrain: Terrain;