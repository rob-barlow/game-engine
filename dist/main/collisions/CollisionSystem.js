export default class CollisionSystem {
    colliders = [];
    register(collider) {
        this.colliders.push(collider);
    }
    deregister(collider) {
        const index = this.colliders.indexOf(collider);
        if (index !== -1) {
            this.colliders.splice(index, 1);
        }
    }
    isInBoundingBox(position) {
        return this.colliders.some(collider => collider.contains(position));
    }
    getBoundingBoxContaining(position) {
        let currentCollider;
        for (let i = 0; i < this.colliders.length; i++) {
            currentCollider = this.colliders[i];
            if (currentCollider.contains(position))
                return currentCollider;
        }
        return null;
    }
}
