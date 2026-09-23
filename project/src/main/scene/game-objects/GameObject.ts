import Collider from "../../collisions/Collider.js";
import MovementSystem from "../../controls/in-game/movement-systems/MovementSystem.js";
import { Transform, Vec3 } from "../../maths/index.js";
import Mesh from "../../meshes/Mesh.js";

export class GameObject {
    transform: Transform;

    constructor(transform: Transform){
        this.transform = transform;
    }

    mesh?: Mesh

    collider?: Collider

    movementSystem?: MovementSystem
}