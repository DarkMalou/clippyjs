
export default class Queue {
    constructor (onEmptyCallback) {
        this.queue = [];
        this.onEmptyCallback = onEmptyCallback;
    }

    add(func) {
        this.queue.push(func);

        if (this.queue.length === 1 && !this.active) {
            this.progressQueue();
        }
    }

    progressQueue() {
        // stop if nothing left in queue
        if (!this.queue.length) {
            this.onEmptyCallback();
            return;
        }

        let f = this.queue.shift();
        this.active = true;

        // execute function
        let completeFunction = this.next.bind(this);
        f(completeFunction);
    }

    clear() {
        this.queue = [];
    }

    next() {
        this.active = false;
        this.progressQueue();
    }
}



