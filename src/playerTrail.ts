import { Vector } from "excalibur";

interface StackNode<T> {
    value: T | null
    next: StackNode<T> | null
}

class StackNode<T> implements StackNode<T> {
    constructor(val: T) {
        this.value = val
        this.next = null
    }
}

interface Stack<T> {
    size: number
    top: StackNode<T> | null
    bottom: StackNode<T> | null
    push(val: T): number
    pop(): StackNode<T> | null
}

class Stack<T = string> implements Stack<T> {
    constructor() {
        this.size = 0
        this.top = null
        this.bottom = null
    }

    push(val: T) {
        const node = new StackNode(val)
        if (this.size === 0) {
            this.top = node
            this.bottom = node
        } else {
            const currentTop = this.top
            this.top = node
            this.top.next = currentTop
        }

        this.size += 1
        return this.size
    }

    pop(): StackNode<T> | null {
        if (this.size > 0) {
            const nodeToBeRemove = this.top as StackNode<T>
            this.top = nodeToBeRemove.next
            this.size -= 1
            nodeToBeRemove.next = null
            return nodeToBeRemove
        }
        return null
    }
}

interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
  }
  class Queue<T> implements IQueue<T> {
    private storage: T[] = [];
  
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

    size(): number {
      return this.storage.length;
    }
  }
export class PlayerTrail extends Queue<Vector> {
    static instance: PlayerTrail;
    private constructor() {
        super();
    }

    public static GetInstance(): PlayerTrail{
        if(!PlayerTrail.instance) {
            PlayerTrail.instance = new PlayerTrail();
        }
        return PlayerTrail.instance;
    }
}