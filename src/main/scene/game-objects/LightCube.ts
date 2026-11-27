import { GameObject } from "./GameObject";
import { Transform, Vec3 } from "../../maths";
import Mesh from "../../meshes/Mesh";
import Texture from "../../meshes/Textures/Textures";

const voxelTriangles: [Vec3, Vec3, Vec3][] = [
    // [
    //     {x: -0.5, y: -0.5, z: -0.5},
    //     {x: -0.5, y: 0.5, z: -0.5},
    //     {x: 0.5, y: 0.5, z: -0.5},
    // ],
    // [
    //     {x: -0.5, y: -0.5, z: -0.5},
    //     {x: 0.5, y: 0.5, z: -0.5},
    //     {x: 0.5, y: -0.5, z: -0.5},
    // ],
    // [
    //     {x: 0.5, y: -0.5, z: 0.5},
    //     {x: 0.5, y: 0.5, z: 0.5},
    //     {x: -0.5, y: 0.5, z: 0.5},
    // ],
    // [
    //     {x: 0.5, y: -0.5, z: 0.5},
    //     {x: -0.5, y: 0.5, z: 0.5},
    //     {x: -0.5, y: -0.5, z: 0.5},
    // ],
    // [
    //     {x: -0.5, y: 0.5, z: -0.5},
    //     {x: -0.5, y: 0.5, z: 0.5},
    //     {x: 0.5, y: 0.5, z: 0.5},
    // ],
    // [
    //     {x: -0.5, y: 0.5, z: -0.5},
    //     {x: 0.5, y: 0.5, z: 0.5},
    //     {x: 0.5, y: 0.5, z: -0.5},
    // ],
    [
        {x: 0.5, y: -0.5, z: -0.5},
        {x: 0.5, y: -0.5, z: 0.5},
        {x: -0.5, y: -0.5, z: 0.5},
    ],
    [
        {x: 0.5, y: -0.5, z: -0.5},
        {x: -0.5, y: -0.5, z: 0.5},
        {x: -0.5, y: -0.5, z: -0.5},
    ],
    // [
    //     {x: -0.5, y: -0.5, z: 0.5},
    //     {x: -0.5, y: 0.5, z: 0.5},
    //     {x: -0.5, y: 0.5, z: -0.5},
    // ],
    // [
    //     {x: -0.5, y: -0.5, z: 0.5},
    //     {x: -0.5, y: 0.5, z: -0.5},
    //     {x: -0.5, y: -0.5, z: -0.5},
    // ],
    // [
    //     {x: 0.5, y: -0.5, z: -0.5},
    //     {x: 0.5, y: 0.5, z: -0.5},
    //     {x: 0.5, y: 0.5, z: 0.5},
    // ] ,
    // [
    //     {x: 0.5, y: -0.5, z: -0.5},
    //     {x: 0.5, y: 0.5, z: 0.5},
    //     {x: 0.5, y: -0.5, z: 0.5},
    // ] 
]


export default class LightCube extends GameObject {
    texture = Texture.Plain;

    constructor(transform: Transform, colour: [number, number, number] = [255, 255, 255]){
        super(transform);
        this.mesh = new Mesh(voxelTriangles, colour);
    }
}