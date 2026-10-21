import { GameObject } from "../../../game-objects/GameObject";
import { Transform } from "../../../../maths";
import LetterMesh from "../../../../meshes/Text/LetterMesh";

export class Letter extends GameObject {
    constructor(transform: Transform, char: string);
    constructor(transform: Transform, char: string, colour?: [number, number, number]){
        super(transform);

        this.mesh = LetterMesh.getLetterMesh(char);

        if (colour){
            this.mesh.colour = colour;
        }
    }
}