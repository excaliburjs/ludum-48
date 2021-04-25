import {Random} from "excalibur"

class WeightPair<T> {
    constructor(weight: number, obj: T | null) {
      this.weight = weight;
      this.obj = obj;
    }
    weight: number;
    obj: T | null;
  }
  export class WeightMap<T> {
    total: number = 0;
    pairs: WeightPair<T>[] = [];
    random: Random;
  
    constructor(random: Random) {
      this.random = random;
    }
  
    add(weight: number, obj: T | null) {
      this.total += weight;
      this.pairs.push(new WeightPair<T>(weight, obj));
    }
  
    randomSelect(defObj: T | null): T | null {
      const roll = this.random.next() * this.total;
      var total = 0;
      var obj: T | null = null;
      this.pairs.forEach((a) => {
        if (obj) return;
        if (roll - total <= a.weight) {
          obj = a.obj;
        }
        total += a.weight;
      });
      return obj ?? defObj;
    }
  }