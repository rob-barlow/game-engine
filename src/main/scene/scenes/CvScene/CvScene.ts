import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import { GameObject } from "../../game-objects";
import { Letter } from "../../game-objects/Letter";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

const cvText = "hello I'm rob\nnew line aaa"

const letterGap = 7

export function createCvScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    addLetters(scene)

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}


function addLetters(scene: Scene) {
    // split by line
    const upperCvText = cvText.toUpperCase();
    const cvLines: string[] = upperCvText.split("\n");

    let xPosition = 0;
    let yPosition = 1;

    for (let rowIndex = 0; rowIndex < cvLines.length; rowIndex++){
        const row = cvLines[rowIndex]
        const rowStartX = -(row.length * 7)/2;
        
        xPosition = rowStartX
        for (let charIndex = 0; charIndex < row.length; charIndex++){
            const currentChar = row[charIndex];

            if (currentChar == " ") {
                xPosition += letterGap;
                continue;
            }

            if (currentChar == "\n") {
                xPosition = rowStartX;
                yPosition -= 7 + letterGap
                continue;
            }
            
            const letterTransform: Transform = {
                position: {x: xPosition, y: yPosition, z: 50},
                orientation: Matrix3.identity(),
                scale: {x: 1, y: 1, z: 1},
            }

            const letter: GameObject = new Letter(letterTransform, currentChar)
            scene.add(letter);
            
            xPosition += letterGap;
        }

        yPosition -= 7 + letterGap
    }
}