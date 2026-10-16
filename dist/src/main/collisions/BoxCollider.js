export default class BoxCollider {
    min;
    max;
    constructor(min, max) {
        const minX = Math.min(min.x, max.x);
        const maxX = Math.max(min.x, max.x);
        const minY = Math.min(min.y, max.y);
        const maxY = Math.max(min.y, max.y);
        const minZ = Math.min(min.z, max.z);
        const maxZ = Math.max(min.z, max.z);
        this.min = { x: minX, y: minY, z: minZ };
        this.max = { x: maxX, y: maxY, z: maxZ };
    }
    contains(position) {
        const xInBox = position.x > this.min.x && position.x < this.max.x;
        const yInBox = position.y > this.min.y && position.y < this.max.y;
        const zInBox = position.z > this.min.z && position.z < this.max.z;
        return xInBox && yInBox && zInBox;
    }
}
