export class GlobalState {
  static instance: GlobalState;
  private constructor() { }
  public static GetInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  public GameOver = false;
}