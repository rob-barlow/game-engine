import BoxCollider from "../../collisions/BoxCollider.js";
import { GameObject } from "./GameObject.js";
export default class Boundary extends GameObject {
    colour = [0, 0, 0];
    collider = new BoxCollider({ x: -0.2, y: 0, z: -0.2 }, { x: 1.2, y: 1, z: 1.2 });
    constructor(transform) {
        super(transform);
    }
}
