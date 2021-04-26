export module Every {
  export abstract class Interval {
    protected internalTimer: number = 0;
    constructor(protected action: Function, protected interval: number) { }

    public Update(delta: number) {
      this.internalTimer += delta;
      if (this.internalTimer >= this.interval) {
        this.action();
        this.internalTimer = 0;
      }
    }
    public UpdateInterval(newInterval: number){
      this.interval = newInterval;
    }
  }

  export class Minute extends Interval {
    constructor(action: Function, minutes: number) { 
      super(action, minutes * 60 * 1000);
    }
    public UpdateInterval(minutes: number){
      super.UpdateInterval(minutes * 60 * 1000);
    }
  }

  export class Second extends Interval {
    constructor(action: Function, seconds: number) { 
      super(action, seconds * 1000);
    }
    public UpdateInterval(seconds: number) {
      super.UpdateInterval(seconds * 1000);
    }
  }

  export class MiliSecond extends Interval{
    constructor(action: Function, milis: number) { 
      super(action, milis);
    }
  }
}