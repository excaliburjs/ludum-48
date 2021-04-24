import { Resource, Texture, Graphics } from "excalibur";
import sword from "./images/sword.png";
import dirt from "./images/placeholder-dirt.png";

let Resources = {
  Sword: new Graphics.ImageSource(sword),
  Dirt: new Graphics.ImageSource(dirt),
};

export { Resources };
