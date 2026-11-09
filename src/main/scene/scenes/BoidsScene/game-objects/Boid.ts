import { GameObject } from "../../../game-objects/GameObject";
import { Transform } from "../../../../maths";
import Mesh from "../../../../meshes/Mesh";
import BoidMovementSystem from "../movement-systems/BoidMovementSystem";

export class Boid extends GameObject {
    mesh?: Mesh = {
        triangles:  [
            // top face
            [{x: 0, y: 0, z: 0},
            {x: 0.5, y: 0, z: 1},
            {x: 0.5, y: 0, z: 0.2}],
            [{x: 0.5, y: 0, z: 0.2},
            {x: 0.5, y: 0, z: 1},
            {x: 1, y: 0, z: 0}],

            // // front face
            // [{x: 0, y: -1, z: 0},
            // {x: 0, y: 0, z: 0},
            // {x: 1, y: 0, z: 0}],
            // [{x: 0, y: -1, z: 0},
            // {x: 1, y: 0, z: 0},
            // {x: 1, y: -1, z: 0}],

            // left face
            // [{x: 0, y: -1, z: 1},
            // {x: 0, y: 0, z: 1},
            // {x: 0, y: 0, z: 0}],
            // [{x: 0, y: -1, z: 1},
            // {x: 0, y: 0, z: 0},
            // {x: 0, y: -1, z: 0}],

            // // bottom face
            // [{x: 0, y: -1, z: 1},
            // {x: 0, y: -1, z: 0},
            // {x: 1, y: -1, z: 1}],
            // [{x: 1, y: -1, z: 1},
            // {x: 0, y: -1, z: 0},
            // {x: 1, y: -1, z: 0}],

            // // back face
            // [{x: 0, y: 0, z: 1},
            // {x: 0, y: -1, z: 1},
            // {x: 1, y: 0, z: 1}],
            // [{x: 1, y: 0, z: 1},
            // {x: 0, y: -1, z: 1},
            // {x: 1, y: -1, z: 1}],

            // // right face
            // [{x: 1, y: 0, z: 1},
            // {x: 1, y: -1, z: 1},
            // {x: 1, y: 0, z: 0}],
            // [{x: 1, y: 0, z: 0},
            // {x: 1, y: -1, z: 1},
            // {x: 1, y: -1, z: 0}],
        ],
        colour: [255, 255, 255]
    }

    movementSystem = new BoidMovementSystem();
    
    
    constructor(transform: Transform, colour?: [number, number, number]){
        super(transform);

        if (colour){
            this.mesh.colour = colour;
        }
    }
}