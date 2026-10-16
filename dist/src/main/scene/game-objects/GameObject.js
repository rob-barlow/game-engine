export class GameObject {
    transform;
    constructor(transform) {
        this.transform = transform;
    }
    mesh;
    collider;
    movementSystem;
}
