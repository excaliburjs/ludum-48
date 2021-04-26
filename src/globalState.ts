export class GlobalState {
  static instance: GlobalState;
  HasSpeedPowerUp = false;

  private constructor() {}
  public static GetInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  public GameOver = false;
  public Round = 0;
  public RoundWon = false;
  public GameWon = false;
}
