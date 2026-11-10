import { GameObject } from "../../../game-objects/GameObject";
import { Transform, Vec3 } from "../../../../maths";
import Mesh from "../../../../meshes/Mesh";
import BoidMovementSystem from "../movement-systems/BoidMovementSystem";

export class Boid extends GameObject {
    mesh?: Mesh = {
        triangles:  [
            // top face
            [{x: -0.5, y: 0, z: -0.5},
            {x: 0, y: 0, z: 0.5},
            {x: 0, y: 0, z: -0.3}],
            [{x: 0, y: 0, z: -0.3},
            {x: 0, y: 0, z: 0.5},
            {x: 0.5, y: 0, z: -0.5}],

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
    
    //directionToCentre: Vec3 = {x: 1, y: 0, z: 0}

    angle: number = 0;
    
    constructor(transform: Transform, colour?: [number, number, number]){
        super(transform);

        if (colour){
            this.mesh.colour = colour;
        }
    }
}