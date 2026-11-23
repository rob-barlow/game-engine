import Collider from "../../collisions/Collider";
import MovementSystem from "../../controls/in-game/movement-systems/MovementSystem";
import { Transform } from "../../maths/index";
import Mesh from "../../meshes/Mesh";
import Texture from "../../meshes/Textures/Textures";

export class GameObject {
    transform: Transform;

    constructor(transform: Transform){
        this.transform = transform;
    }

    mesh?: Mesh

    collider?: Collider

    movementSystem?: MovementSystem

    texture: Texture = Texture.Plain
}