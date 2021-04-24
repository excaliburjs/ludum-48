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

export class PlayerTrail extends Stack<Vector> {
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