import { Resource, Texture, Graphics, Sound } from "excalibur";
import sword from "./images/sword.png";
import dirt from "./images/dirt_001.png";
import rock from "./images/rock_001.png";
import digWav from "./sound/dig.wav";
import digMp3 from "./sound/dig.mp3";
import clankWav from "./sound/clank.wav";
import clankMp3 from "./sound/clank.mp3";

let Resources = {
  Sword: new Graphics.ImageSource(sword),
  Dirt: new Graphics.ImageSource(dirt),
  Rock: new Graphics.ImageSource(rock),
  DigSound: new Sound(digMp3, digWav),
  ClankSound: new Sound(clankMp3, clankWav),
};

export { Resources };
