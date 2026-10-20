import { Vec3 } from "../../maths";
import Mesh from "../Mesh";

type MeshData = {
    vertices: Vec3[],
    coordIndex: number[]
}

const MeshData = {
    meshDataToMesh(meshData: MeshData): Mesh {
        const triangles: [Vec3, Vec3, Vec3][] = []

        let currentTriangle: Vec3[] = []
        for (let i = 0; i < meshData.coordIndex.length; i++){
            const vertexIndex = meshData.coordIndex[i]
            if (vertexIndex == -1){
                if (currentTriangle.length != 3){
                    continue;
                }

                triangles.push(currentTriangle as [Vec3, Vec3, Vec3])
                
                currentTriangle = []

                continue;
            }

            currentTriangle.push(meshData.vertices[vertexIndex])
        }

        return new Mesh(triangles, [200, 0, 200])
    },

    objToMeshData(objFileContents: string): MeshData {
        const meshData: MeshData = {
            vertices: [],
            coordIndex: []
        }
        
        const lines = objFileContents.trim().split("\n").map(stringRow => stringRow.trim());
        
        lines.forEach(line => {
            const lineContent = line.substring(2)
            switch(line[0])
            {
                case "v":
                    const vertexArray = lineContent.split(" ").map(val => Number(val)) as [number, number, number]
                    const vertex: Vec3 = {x: vertexArray[0], y: vertexArray[1], z: vertexArray[2]}
                    meshData.vertices.push(vertex);
                    break;
                case "f":
                    const indicesArray = lineContent.split(" ").map(val => Number(val)) as number[]
                    meshData.coordIndex.push(...indicesArray, -1);
                    break;
                default:
                    console.log("shiz: " + line)
                    break;
            }

        })


        // console.log("end: " + JSON.stringify(meshData.coordIndex))

        return meshData;
    }
}

export default MeshData;
