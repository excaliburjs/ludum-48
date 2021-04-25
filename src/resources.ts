import { Graphics, Sound } from "excalibur";
import sword from "./images/sword.png";
import dirt from "./images/dirt_001.png";
import dirtBackground from "./images/dirt_back.png";
import dirtTunnel from "./images/dirt_tunnel.png";
import dirtSide from "./images/dirt_side.png";
import dirtAngle from "./images/dirt_angle.png";
import rock from "./images/rock_001.png";
import rock2 from "./images/rock_002.png";
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
  DirtSide: new Graphics.ImageSource(dirtSide),
  DirtBackground: new Graphics.ImageSource(dirtBackground),
  DirtTunnel: new Graphics.ImageSource(dirtTunnel),
  DirtAngle: new Graphics.ImageSource(dirtAngle),
  Rock: new Graphics.ImageSource(rock),
  Rock2: new Graphics.ImageSource(rock2),
  DigSound: new Sound(digMp3, digWav),
  ClankSound: new Sound(clankMp3, clankWav),
  BackgroundMusic: new Sound(backgroundMp3, backgroundWav),
  Modal: new Graphics.ImageSource(modal),
  Snek: new Graphics.ImageSource(snek),
};

Resources.BackgroundMusic.loop = true;
Resources.BackgroundMusic.volume = 0.1;

export { Resources };
