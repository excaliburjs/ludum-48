import { Loadable, Sound } from "excalibur";
import classNames from "classnames";
import Config from "./config";
import { Preferences, savePreferences } from "./preferences";
import { Resources } from "./resources";

export class SoundManager {
  static setSoundSpecificVolume() {
    Resources.BackgroundMusic.volume = Config.BackgroundVolume;
    Resources.PickUpSound.volume = Config.PickupSoundVolume;
    Resources.FallSound.volume = Config.BackgroundVolume;
    // Resources.sndCardExpired.volume = Config.CueCardExpiredVolume;
    // Resources.sndCardSuccess.volume = Config.CueCardSuccessVolume;
    // Resources.sndDoorOpen.volume = Config.DoorOpenVolume;
    // Resources.sndPickupItem.volume = Config.PickupItemVolume;
  }

  static init() {
    SoundManager.setSoundSpecificVolume();
    if (Preferences.muteBackgroundMusic) {
      SoundManager.muteBackgroundMusic();
    }
    if (Preferences.muteAll) {
      SoundManager.muteAll();
    }

    $("#mute-music").on("click", () => {
      if (Preferences.muteBackgroundMusic) {
        SoundManager.unmuteBackgroundMusic();
      } else {
        SoundManager.muteBackgroundMusic();
      }
      savePreferences();
      return false;
    });

    $("#mute-all").on("click", () => {
      if (Preferences.muteAll) {
        SoundManager.unmuteAll();
      } else {
        SoundManager.muteAll();
      }
      savePreferences();
      return false;
    });
  }

  static muteAll() {
    Preferences.muteAll = true;
    Preferences.muteBackgroundMusic = true;

    for (let r in Resources) {
      let snd = (Resources as any)[r];
      if (snd instanceof Sound) {
        snd.volume = 0;
      }
    }
    SoundManager.muteBackgroundMusic();
    SoundManager._updateMuteAllButton();
  }

  static unmuteAll() {
    Preferences.muteAll = false;
    Preferences.muteBackgroundMusic = false;

    for (var r in Resources) {
      let snd = (Resources as any)[r];
      if (snd instanceof Sound) {
        snd.volume = Config.SoundVolume;
      }
    }
    SoundManager.setSoundSpecificVolume();
    SoundManager.unmuteBackgroundMusic();
    SoundManager._updateMuteAllButton();
  }

  static startBackgroundMusic() {
    // start bg music
    Resources.BackgroundMusic.volume = Preferences.muteBackgroundMusic
      ? 0
      : Config.BackgroundVolume;
    Resources.BackgroundMusic.loop = true;
    if (!Resources.BackgroundMusic.isPlaying())
      Resources.BackgroundMusic.play();
  }

  static stopBackgroundMusic() {
    // stop bg music
    Resources.BackgroundMusic.loop = false;
  }

  static muteBackgroundMusic() {
    Preferences.muteBackgroundMusic = true;

    // mute bg music
    Resources.BackgroundMusic.volume = 0;
    SoundManager._updateMusicButton();
  }

  static unmuteBackgroundMusic() {
    Preferences.muteBackgroundMusic = false;

    // unmute bg music
    Resources.BackgroundMusic.volume = Config.BackgroundVolume;

    SoundManager._updateMusicButton();
  }

  static playSetMusic(round: number) {
    Resources.SetMusic1.volume = Preferences.muteAll ? 0 : Config.SoundVolume;
    Resources.SetMusic2.volume = Preferences.muteAll ? 0 : Config.SoundVolume;
    Resources.SetMusic3Lead.volume = Preferences.muteAll
      ? 0
      : Config.SoundVolume;
    Resources.SetMusic3Background.volume = Preferences.muteAll
      ? 0
      : Config.SoundVolume;

    switch (round) {
      case 1:
        Resources.SetMusic1.play();
        break;
      case 2:
        Resources.SetMusic2.play();
        break;
      case 3:
        Resources.SetMusic3Lead.play();
        Resources.SetMusic3Background.play();
        break;
    }
  }

  private static _updateMusicButton() {
    $("#mute-music i").get(0).className = classNames("fa", {
      "fa-music": !Preferences.muteBackgroundMusic,
      "fa-play": Preferences.muteBackgroundMusic,
    });
  }

  private static _updateMuteAllButton() {
    $("#mute-all i").get(0).className = classNames("fa", {
      "fa-volume-up": !Preferences.muteAll,
      "fa-volume-off": Preferences.muteAll,
    });
  }
}
