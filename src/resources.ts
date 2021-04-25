import { Graphics, Sound } from "excalibur";
import sword from "./images/sword.png";
import dirt from "./images/dirt_001.png";
import dirtBackground from "./images/dirt_back.png";
import rock from "./images/rock_001.png";
import digWav from "./sound/dig.wav";
import digMp3 from "./sound/dig.mp3";
import clankWav from "./sound/clank.wav";
import clankMp3 from "./sound/clank.mp3";
import backgroundMp3 from "./sound/background.mp3";
import backgroundWav from "./sound/background.mp3";
import modal from "./images/modal.png";
import snek from "./images/snek.png";

let Resources = {
  Sword: new Graphics.ImageSource(sword),
  Dirt: new Graphics.ImageSource(dirt),
  DirtBackground: new Graphics.ImageSource(dirtBackground),
  Rock: new Graphics.ImageSource(rock),
  DigSound: new Sound(digMp3, digWav),
  ClankSound: new Sound(clankMp3, clankWav),
  BackgroundMusic: new Sound(backgroundMp3, backgroundWav),
  Modal: new Graphics.ImageSource(modal),
  Snek: new Graphics.ImageSource(snek),
};

Resources.BackgroundMusic.loop = true;
Resources.BackgroundMusic.volume = 0.1;

export { Resources };
