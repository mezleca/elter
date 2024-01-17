import { EventEmitter } from 'events';

export const Queues = new Map();

export class Queue extends EventEmitter {
    constructor(id) {
        super();
        this.queue = [];
        this.id = id;
        this.skipped = false;
    }
    
    add(id, name) {
        this.queue.push({ name: name, id: id });
        this.emit('add', name);
    }
    
    remove() {
        const item = this.queue.shift();
        this.emit('remove', item);

        if (this.queue.length === 0) {
            this.emit('end');
        }

        return item;
    }

    get(item) {
        return this.queue.find((i) => i.id === item.id);
    }

    skip() {

        if (this.queue.length - 1 <= 0) {
            console.log("chegou no final da queue");
            return this.emit('end');
        }

        const item = this.queue.shift();
        
        this.skipped = true;
        this.emit('skip', item);
    }
    
    get length() {
        return this.queue.length;
    }
    
    get first() {
        return this.queue[0];
    }
};