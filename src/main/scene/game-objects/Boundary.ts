import BoxCollider from "../../collisions/BoxCollider.js";
import { Transform, Vec3 } from "../../maths/index.js";
import { GameObject } from "./GameObject.js";

export default class Boundary extends GameObject {
    colour: [number, number, number] = [0,0,0];

    collider: BoxCollider = new BoxCollider({x: -0.2, y: 0, z: -0.2}, {x: 1.2, y: 1, z: 1.2});
    
    constructor(transform: Transform){
        super(transform)
    }
}