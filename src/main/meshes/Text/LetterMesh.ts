import { Vec3 } from "../../maths";
import Mesh from "../Mesh";
import { glyphs } from "./Glyphs";

const LetterMesh = {
    getLetterMesh(char: string): Mesh {
        const bitmap = glyphs[char]
        let faces: [Vec3, Vec3, Vec3, Vec3][] = [];
    
        for (let rowIndex = 0; rowIndex < bitmap.length; rowIndex++){
            const row = bitmap[rowIndex]
            for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
                const pos = row[columnIndex];
                if (pos == "#"){
                    const voxelFaces = getVoxelFaces({x: columnIndex, y: bitmap.length-rowIndex, z: 0});
                    faces.push(...voxelFaces);
                }
            }
        }

        for (let i = 0; i < faces.length; i++){
            const currentFace = faces[i];

            for (let j = 0; j < faces.length; j++){
                if (i == j) continue;

                const otherFace = faces[j]

                for (let vertexIndex = 0; vertexIndex < 4; vertexIndex++){
                    const currentVertex = currentFace[vertexIndex];
                    if (otherFace.every(otherVertex => {
                        return !(otherVertex.x == currentVertex.x &&
                        otherVertex.y == currentVertex.y &&
                        otherVertex.z == currentVertex.z)
                    })){
                        break;
                    }

                    if (vertexIndex == 3){
                        faces = faces.filter(t => t != currentFace && t != otherFace)
                    }
                }
            }
        }

        const triangles: [Vec3, Vec3, Vec3][] = [];
        faces.forEach(face => {
            triangles.push([face[0], face[1], face[2]], [face[0], face[2], face[3]]);
        })

        return {
            triangles: triangles,
            colour: [255,232,31]
        };
    },

    
}

export default LetterMesh;

function getVoxelFaces(origin: Vec3): [Vec3, Vec3, Vec3, Vec3][] {
    const faces: [Vec3, Vec3, Vec3, Vec3][] = [];

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
        const face: [Vec3, Vec3, Vec3, Vec3] = [
            Vec3.add(origin, faceVertices[0]),
            Vec3.add(origin, faceVertices[1]),
            Vec3.add(origin, faceVertices[2]),
            Vec3.add(origin, faceVertices[3])
        ]
    
        faces.push(face);
    })


    return faces;
}
