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
import pickupMp3 from "./sound/getitem.mp3";
import pickupWav from "./sound/getitem.wav";
import backgroundMp3 from "./sound/background.mp3";
import backgroundWav from "./sound/background.wav";
import modal from "./images/modal.png";
import snek from "./images/snek.png";
import speedPowerUp from "./images/energy-drink.png";
import progressMeter from "./images/meter.png";
import spriteFont from "./images/spritefont.png";
import avatar from "./images/meerkat_avatars.png";
import digging from "./images/digging.png";
import frontFacing from "./images/meerkat_front-facing.png";
import chuChuMp3 from "./sound/chuchu.mp3";
import chuChuWav from "./sound/chuchu.wav";

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
  PickUpSound: new Sound(pickupMp3, pickupWav),
  BackgroundMusic: new Sound(backgroundMp3, backgroundWav),
  Modal: new Graphics.ImageSource(modal),
  Snek: new Graphics.ImageSource(snek),
  SpeedPowerUp: new Graphics.ImageSource(speedPowerUp),
  ProgressMeter: new Graphics.ImageSource(progressMeter),
  SpriteFont: new Graphics.ImageSource(spriteFont),
  Avatar: new Graphics.ImageSource(avatar),
  Digging: new Graphics.ImageSource(digging),
  FrontFacing: new Graphics.ImageSource(frontFacing),
  ChuChu: new Sound(chuChuMp3, chuChuWav),
};

Resources.BackgroundMusic.loop = true;

export { Resources };
