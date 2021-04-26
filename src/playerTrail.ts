import { Vector } from "excalibur";
interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}
class Queue<T> implements IQueue<T> {
  protected storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error("Queue has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }

  dequeue(): T | undefined {
    return this.storage.shift();
  }

  peekLast(): T | undefined {
    return this.storage[this.size() - 1];
  }

  size(): number {
    return this.storage.length;
  }

  clear(): void {
    this.storage = [];
  }
}
export class PlayerTrail extends Queue<Vector> {
  static instance: PlayerTrail;
  private constructor() {
    super();
  }

  public get trail(): readonly Vector[] {
    return this.storage;
  }

  public static GetInstance(): PlayerTrail {
    if (!PlayerTrail.instance) {
      PlayerTrail.instance = new PlayerTrail();
    }
    return PlayerTrail.instance;
  }

  Remove(item: Vector) {
    this.storage = this.storage.filter(
      (path) => !(path.y === item.y && path.x === item.x)
    );
  }

  RemoveLast() {
    this.storage.pop();
  }

  Contains(item: Vector): boolean {
    return (
      this.storage.findIndex(
        (path) => path.x === item.x && path.y === item.y
      ) !== -1
    );
  }
}
