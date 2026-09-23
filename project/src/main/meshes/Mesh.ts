import { Vec3 } from "../maths/index.js";

export default class Mesh {
    triangles: [Vec3, Vec3, Vec3][]

    colour: [number, number, number]

    constructor(triangles: [Vec3, Vec3, Vec3][], colour: [number, number, number]){
        this.triangles = triangles;
        this.colour = colour;
    }

}