import { Resource, Texture, Graphics, Sound } from "excalibur";
import sword from "./images/sword.png";
import dirt from "./images/placeholder-dirt.png";
import digWav from "./sound/dig.wav";
import digMp3 from "./sound/dig.mp3";

let Resources = {
  Sword: new Graphics.ImageSource(sword),
  Dirt: new Graphics.ImageSource(dirt),
  DigSound: new Sound(digMp3, digWav)
};

export { Resources };
