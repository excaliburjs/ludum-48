import { Graphics, Sound } from "excalibur";
import sword from "./images/sword.png";
import dirt from "./images/dirt_001.png";
import dirtBackground from "./images/dirt_back.png";
import dirtTunnel from "./images/dirt_tunnel.png";
import dirtSide from "./images/dirt_side.png";
import dirtAngle from "./images/dirt_angle.png";
import rock from "./images/rock_001.png";
import rock2 from "./images/rock_002.png";
import fallWav from "./sound/fall.wav";
import clankWav from "./sound/clank.wav";
import clankMp3 from "./sound/clank.mp3";
import pickupWav from "./sound/getitem.wav";
import backgroundMp3 from "./sound/background.mp3";
import backgroundWav from "./sound/background.wav";
import modal from "./images/modal.png";
import snek from "./images/mecha-snek.png";
import speedPowerUp from "./images/energy-drink.png";
import progressMeter from "./images/meter.png";
import spriteFont from "./images/spritefont.png";
import avatar from "./images/meerkat_avatars.png";
import digging from "./images/digging.png";
import frontFacing from "./images/meerkat_front-facing.png";
import chuChuMp3 from "./sound/chuchu_alt.mp3";
import chuChuWav from "./sound/chuchu_alt.wav";
import beetle from "./images/beetle.png";
import undergroundSet from "./images/underground_set.png";
import undergroundSetInstruments from "./images/underground_set_instruments.png";
import playAgainButton from "./images/play-again-button.png";

import drummerMeerkatFrontFacing from "./images/meerkat_1_front-facing.png";
import vocalistMeerkatFrontFacing from "./images/meerkat_2_front-facing.png";
import bassistMeerkatFrontFacing from "./images/meerkat_3_front-facing.png";
import guitaristMeerkatFrontFacing from "./images/meerkat_4_front-facing.png";

import drummerMeerkatPlaying from "./images/animated_meerkats/drums_animation.png";
import bassistMeerkatPlaying from "./images/animated_meerkats/bass_guitar_animation.png";
import guitaristMeerkatPlaying from "./images/animated_meerkats/guitar_animation.png";
import vocalistMeerkatPlaying from "./images/animated_meerkats/singer_jumping_animation.png";

import setMusic1Wav from "./sound/set1.wav";
import setMusic2Wav from "./sound/set2.wav";
import setMusic3LeadWav from "./sound/set3lead.wav";
import setMusic3BgWav from "./sound/set3bg.wav";

import dig1 from "./sound/dig chugs/HMRhyB Chug-A.wav";
import dig2 from "./sound/dig chugs/HMRhyB Chug-B.wav";
import dig3 from "./sound/dig chugs/HMRhyB Chug-C.wav";
import dig4 from "./sound/dig chugs/HMRhyB Chug-D Hi.wav";
import dig5 from "./sound/dig chugs/HMRhyB Chug-D Lo.wav";
import dig6 from "./sound/dig chugs/HMRhyB Chug-E.wav";
import dig7 from "./sound/dig chugs/HMRhyB Chug-F.wav";
import dig8 from "./sound/dig chugs/HMRhyB Chug-G.wav";

let Resources = {
  Sword: new Graphics.ImageSource(sword),
  Dirt: new Graphics.ImageSource(dirt),
  DirtSide: new Graphics.ImageSource(dirtSide),
  DirtBackground: new Graphics.ImageSource(dirtBackground),
  DirtTunnel: new Graphics.ImageSource(dirtTunnel),
  DirtAngle: new Graphics.ImageSource(dirtAngle),
  Rock: new Graphics.ImageSource(rock),
  Rock2: new Graphics.ImageSource(rock2),
  DigSound1: new Sound(dig1),
  DigSound2: new Sound(dig2),
  DigSound3: new Sound(dig3),
  DigSound4: new Sound(dig4),
  DigSound5: new Sound(dig5),
  DigSound6: new Sound(dig6),
  DigSound7: new Sound(dig7),
  DigSound8: new Sound(dig8),
  ClankSound: new Sound(clankMp3, clankWav),
  PickUpSound: new Sound(pickupWav),
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
  Beetle: new Graphics.ImageSource(beetle),
  UndergroundSet: new Graphics.ImageSource(undergroundSet),
  UndergroundSetInstruments: new Graphics.ImageSource(
    undergroundSetInstruments
  ),
  PlayAgainButton: new Graphics.ImageSource(playAgainButton),

  // meerkatz
  MeerkatDrummerFrontFacing: new Graphics.ImageSource(
    drummerMeerkatFrontFacing
  ),
  MeerkatBassistFrontFacing: new Graphics.ImageSource(
    bassistMeerkatFrontFacing
  ),
  MeerkatVocalistFrontFacing: new Graphics.ImageSource(
    vocalistMeerkatFrontFacing
  ),
  MeerkatGuitaristFrontFacing: new Graphics.ImageSource(
    guitaristMeerkatFrontFacing
  ),

  MeerkatDrummerPlaying: new Graphics.ImageSource(drummerMeerkatPlaying),
  MeerkatBassistPlaying: new Graphics.ImageSource(bassistMeerkatPlaying),
  MeerkatVocalistPlaying: new Graphics.ImageSource(vocalistMeerkatPlaying),
  MeerkatGuitaristPlaying: new Graphics.ImageSource(guitaristMeerkatPlaying),

  SetMusic1: new Sound(setMusic1Wav),
  SetMusic2: new Sound(setMusic2Wav),
  SetMusic3Lead: new Sound(setMusic3LeadWav),
  SetMusic3Background: new Sound(setMusic3BgWav),
  FallSound: new Sound(fallWav),
};

Resources.BackgroundMusic.loop = true;

export { Resources };
