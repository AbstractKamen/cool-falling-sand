class BinaryHeap {
    constructor(comparator) {
        this.items = [];
        this.size = 0;
        this.comparator = comparator;
        if (comparator === undefined) {
            this.comparator = (a, b) => a - b
        }
    }

    isEmpty() {
        return this.size === 0;
    }

    push(item) {
        this.items[this.size] = item;
        this.heapifyUp(this.size);
        ++this.size;
    }

    pop() {
        if (this.isEmpty()) return null;
        let result = this.items[0];
        --this.size;
        if (this.size > 0) {
            this.items[0] = this.items[this.size];
            this.heapifyDown(0);
        }
        return result;
    }

    heapifyUp(i) {
        while (i > 0) {
            let parent = (i - 1) >>> 1;
            if (this.comparator(this.items[i], this.items[parent]) >= 0) {
                this.swap(i, parent);
                i = parent;
            } else {
                return;
            }
        }
    }

    heapifyDown(i) {
        let half = this.size >>> 1;
        while (i < half) {
            let largest = this.largestChild(i);
            if (largest === i) {
                return;
            }
            this.swap(i, largest);
            i = largest;
        }
    }

    largestChild(i) {
        let left = (i << 1) + 1;
        let right = left + 1;
        let largest = i;
        if (
            left < this.size &&
            this.comparator(this.items[largest], this.items[left]) < 0
        ) {
            largest = left;
        }
        if (
            right < this.size &&
            this.comparator(this.items[largest], this.items[right]) < 0
        ) {
            largest = right;
        }
        return largest;
    }

    swap(a, b) {
        let tempA = this.items[a];
        this.items[a] = this.items[b];
        this.items[b] = tempA;
    }

    clear() {
        this.items.length = 0;
        this.size = 0;
    }
}