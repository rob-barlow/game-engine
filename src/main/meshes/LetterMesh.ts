import { Vec3 } from "../maths";
import Mesh from "./Mesh";

class LetterMeshes {
    MeshA: Mesh = meshA;
}

export default LetterMeshes

const A = [
  "01110",
  "10001",
  "11111",
  "10001",
  "10001",
];

const triangles: [Vec3, Vec3, Vec3][] = [];

for (let rowIndex = 0; rowIndex < A.length; rowIndex++){
    const row = A[rowIndex]
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const pos = Number(row[columnIndex]);
        if (pos == 1){
            // add 12 triangles
            const x = columnIndex
            const y = -rowIndex
            const z = 0;

            // const origin = {x: x, y: y, z: z};
            // const vectors = [
            //     {x: 0, y: 0, z: 0},
            //     {x: 1, y: 0, z: 0},
            //     {x: 1, y: -1, z: 0},
            //     {x: 0, y: -1, z: 0},
            //     {x: 0, y: 0, z: 0},
            //     {x: 0, y: 0, z: 0},
            // ]

            const t1: [Vec3, Vec3, Vec3] = [
                {x: x, y: y, z: z},
                {x: x + 1, y: y, z: z},
                {x: x + 1, y: y - 1, z: z}
            ]
            
            const t2: [Vec3, Vec3, Vec3] = [
                {x: x + 1, y: y - 1, z: z},
                {x: x, y: y - 1, z: z},
                {x: x, y: y, z: z},
            ]

            triangles.push(t1, t2)
        }
    }
}

const meshA: Mesh = {
    triangles: triangles,
    colour: [0,0,255]
}