import Mesh from "../../meshes/Mesh.js";
import { GameObject } from "./GameObject.js";
const panelVertices = [
    [{ x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 1, y: 0, z: 1 }],
    [{ x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 1 },
        { x: 1, y: 0, z: 0 },]
];
export class Panel extends GameObject {
    mesh;
    // collider: BoxCollider = new BoxCollider({x: -0.01, y: -nearPlaneZ * 2.5, z: -0.01}, {x: 1.01, y: 2.5 * nearPlaneZ, z: 1.01})
    constructor(transform, colour = [0, 0, 255]) {
        super(transform);
        this.mesh = new Mesh(panelVertices, colour);
    }
}
