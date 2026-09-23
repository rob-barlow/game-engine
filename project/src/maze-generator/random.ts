export class Random {
    private rng: () => number;

    constructor(seed: number = Date.now()) {
        this.rng = this.mulberry32(seed);
    }

    random() {
        return this.rng();
    }

    randomInt(min: number, max: number) {
        return min + Math.floor(this.random() * (max - min + 1));
    }

    private mulberry32(seed: number) {
        return function () {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
}