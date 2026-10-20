import { Vec3 } from "../../maths";
import Mesh from "../Mesh";
import { glyphs } from "./Glyphs";

const LetterMesh = {
    getLetterMesh(char: string): Mesh {
        const bitmap = glyphs[char]
        let triangles: [Vec3, Vec3, Vec3][] = [];
    
        for (let rowIndex = 0; rowIndex < bitmap.length; rowIndex++){
            const row = bitmap[rowIndex]
            for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                const pos = row[columnIndex];
                if (pos == "#"){
                    const voxelTriangles = getVoxelTriangles({x: columnIndex, y: bitmap.length-rowIndex, z: 0});
                    triangles.push(...voxelTriangles);
                }
            }
        }

        for (let i = 0; i < triangles.length; i++){
            const currentTriangle = triangles[i];

            for (let j = 0; j < triangles.length; j++){
                if (i == j) continue;
                const otherTriangle = triangles[j]

                for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++){
                    const currentVertex = currentTriangle[vertexIndex];
                    if (!otherTriangle.includes(currentVertex)){
                        break;
                    }

                    if (vertexIndex == 2){
                        triangles = triangles.filter(t => t != currentTriangle && t != otherTriangle)
                    }
                }
            }
        }

        return {
            triangles: triangles,
            colour: [255,232,31]
        };
    },

    
}

export default LetterMesh;

function getVoxelTriangles(origin: Vec3){
    let triangles: [Vec3, Vec3, Vec3][] = [];

    const frontFaceVertices = [
        {x: 0, y: 0, z: 0},
        {x: 0, y: 1, z: 0},
        {x: 1, y: 1, z: 0},
        {x: 1, y: 0, z: 0},
    ]

    const rearFaceVertices = [
        {x: 1, y: 0, z: 1},
        {x: 1, y: 1, z: 1},
        {x: 0, y: 1, z: 1},
        {x: 0, y: 0, z: 1},
    ]

    const topFaceVertices = [
        {x: 0, y: 1, z: 0},
        {x: 0, y: 1, z: 1},
        {x: 1, y: 1, z: 1},
        {x: 1, y: 1, z: 0},
    ]

    const bottomFaceVertices = [
        {x: 1, y: 0, z: 0},
        {x: 1, y: 0, z: 1},
        {x: 0, y: 0, z: 1},
        {x: 0, y: 0, z: 0},
    ]

    const leftFaceVertices = [
        {x: 0, y: 0, z: 1},
        {x: 0, y: 1, z: 1},
        {x: 0, y: 1, z: 0},
        {x: 0, y: 0, z: 0},
    ]

    const rightFaceVertices = [
        {x: 1, y: 0, z: 0},
        {x: 1, y: 1, z: 0},
        {x: 1, y: 1, z: 1},
        {x: 1, y: 0, z: 1},
    ]

    const vertices = [frontFaceVertices, rearFaceVertices, topFaceVertices, bottomFaceVertices, leftFaceVertices, rightFaceVertices];

    vertices.forEach(faceVertices => {
        const t1: [Vec3, Vec3, Vec3] = [
            Vec3.add(origin, faceVertices[0]),
            Vec3.add(origin, faceVertices[1]),
            Vec3.add(origin, faceVertices[2])
        ]

        
        const t2: [Vec3, Vec3, Vec3] = [
            Vec3.add(origin, faceVertices[2]),
            Vec3.add(origin, faceVertices[3]),
            Vec3.add(origin, faceVertices[0])
        ]
    
        triangles.push(t1, t2);
    })

     return triangles;    
}