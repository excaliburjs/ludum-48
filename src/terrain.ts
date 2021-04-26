import {
  Cell,
  Engine,
  Graphics,
  Random,
  Sound,
  TileMap,
  Util,
} from "excalibur";
import { Resources } from "./resources";
import config from "./config";
import { PowerUp, Collectible } from "./powerup";
import { WeightMap } from "./weightmap";

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
    spriteImages: Graphics.ImageSource[] | null,
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
  protected spriteImages: Graphics.ImageSource[] | null;
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

  static HasBeetle(cell: Cell | null): boolean {
    if (cell) {
      return cell.hasTag("beetle");
    }
    return false;
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
    DirtTerrain = new DirtTerrainImpl();
  }
}

class DirtTerrainImpl extends Terrain {
  constructor() {
    super(DirtTag, true, () => config.DigTime, [Resources.Dirt], null);
  }

  playSound() {
    Resources.GroundDig.play();
    // const sound = new Random().pickOne([
    //   Resources.DigSound1,
    //   Resources.DigSound2,
    //   Resources.DigSound3,
    //   Resources.DigSound4,
    //   Resources.DigSound5,
    //   Resources.DigSound6,
    //   Resources.DigSound7,
    //   Resources.DigSound8,
    // ]);

    // sound.play();
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
      northEdge.rotation = Util.toRadians(180);
      this.blockSprites.push(northEdge);
    }
    if (this.sides.east) {
      const eastEdge = Resources.DirtSide.toSprite();
      eastEdge.rotation = Util.toRadians(-90);
      this.blockSprites.push(eastEdge);
    }
    if (this.sides.west) {
      const westEdge = Resources.DirtSide.toSprite();
      westEdge.rotation = Util.toRadians(90);
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
