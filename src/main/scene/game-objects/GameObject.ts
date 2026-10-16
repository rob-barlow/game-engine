import Collider from "../../collisions/Collider";
import MovementSystem from "../../controls/in-game/movement-systems/MovementSystem";
import { Transform, Vec3 } from "../../maths/index";
import Mesh from "../../meshes/Mesh";

export class GameObject {
    transform: Transform;

    constructor(transform: Transform){
        this.transform = transform;
    }

    mesh?: Mesh

    collider?: Collider

    movementSystem?: MovementSystem
}