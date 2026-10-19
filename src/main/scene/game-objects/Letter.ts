import { GameObject } from "./GameObject";
import { Transform } from "../../maths";
import Mesh from "../../meshes/Mesh";

export class Letter extends GameObject {
    constructor(transform: Transform, colour: [number, number, number] = [0, 0, 255], mesh: Mesh){
        super(transform);
        this.mesh = mesh;
    }
}