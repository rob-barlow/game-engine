import { GameObject } from "./GameObject";
import { Transform, Vec3 } from "../../maths";
import LetterMesh from "../../meshes/Text/LetterMesh";
import { Letter } from "./Letter";

export class TextObject extends GameObject {
    constructor(transform: Transform, letters: Letter[]){
        super(transform);

        const meshTriangles = [];
        this.mesh = letters[0].mesh;
        
        letters.forEach(letter => {
            const currentTriangles = letter.mesh.triangles;
            const translatedTriangles = currentTriangles.map(triangle => {
                return triangle.map(vertex => {
                    const offset = {x: letter.transform.position.x/letter.transform.scale.x, y: letter.transform.position.y/letter.transform.scale.y, z: letter.transform.position.z/letter.transform.scale.z}
                    return Vec3.add(vertex, offset)
                })
            })

            meshTriangles.push(...translatedTriangles);
        })

        this.mesh.triangles = meshTriangles;
    }
}