import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import { GameObject } from "../../game-objects";
import { Letter } from "../../game-objects/Letter";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

let cvText = "hello I'm rob"
cvText = cvText.toUpperCase();

const letterGap = 7
const centerOffset = 53

export function createCvScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    addLetters(scene)

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}


function addLetters(scene: Scene) {
    for (let charIndex = 0; charIndex < cvText.length; charIndex++){
        const currentChar = cvText[charIndex];

        if (currentChar == " ") continue;
        
        const letterTransform: Transform = {
            position: {x: charIndex * letterGap - centerOffset, y: 1, z: 50},
            orientation: Matrix3.identity(),
            scale: {x: 1, y: 1, z: 1},
        }

        const letter: GameObject = new Letter(letterTransform, currentChar)
        scene.add(letter);
    }

}