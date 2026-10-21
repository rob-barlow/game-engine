import { Controller } from "../../../controls/in-game/controllers/Controller";
import { TextController } from "../../../controls/in-game/controllers/TextController";
import { Matrix3, Transform } from "../../../maths/index";
import { GameObject } from "../../game-objects";
import { Letter } from "../../game-objects/Letter";
import { TextObject } from "../../game-objects/TextObject";
import { Scene } from "../../Scene";
import { addDrone, addPlayer } from "../Extensions";

const letterSize = 1/5;
const letterGap = 7 * letterSize;
const rowCharLength = 20;
const startXPosition = 0;
const startYPosition = 5;
const startZPosition = 5;

export function createCvScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    const droneController = addDrone(scene);

    const textController = addText(scene)

    return {scene: scene, controllers: [droneController, textController]};
}

function addText(scene: Scene) {
    const cvLines: string[] = getCvRows();
    const letters: Letter[] = []

    let xPosition = startXPosition;
    let yPosition = startYPosition;
    let zPosition = startZPosition;

    for (let rowIndex = 0; rowIndex < cvLines.length; rowIndex++){
        const row = cvLines[rowIndex]
        const rowStartX = -(row.length * (letterSize + letterGap))/2;
        
        xPosition = rowStartX
        for (let charIndex = 0; charIndex < row.length; charIndex++){
            const currentChar = row[charIndex];

            if (currentChar == " ") {
                xPosition += letterGap;
                continue;
            }

            if (currentChar == "\n") {
                xPosition = rowStartX;
                yPosition -= letterSize + letterGap
                continue;
            }
            
            const letterTransform: Transform = {
                position: {x: xPosition, y: yPosition, z: zPosition},
                orientation: Matrix3.identity(),
                scale: {x: letterSize, y: letterSize, z: letterSize},
            }

            const letter: GameObject = new Letter(letterTransform, currentChar)
            letters.push(letter)
            
            xPosition += letterGap;
        }
        
        yPosition -= letterSize + letterGap
    }

    const textTransform: Transform = {
        position: {x: startXPosition, y: startYPosition, z: startZPosition},
            orientation: Matrix3.identity(),
            scale: {x: letterSize, y: letterSize, z: letterSize},
        }
        
    const text: GameObject = new TextObject(textTransform, letters)

    const textController = new TextController(text)

    scene.add(text)

    return textController;
}

function getCvRows(){
    let cvText = "Software Developer specialising in full-stack application development with C#, .NET, ASP.NET Core, and mod" +
    "ern web technologies. Experienced in collaborating within development teams, communicating technical concepts" +
    "clearly, and contributing across the software development lifecycle. Particularly interested in networking, low-level" +
    "programming, hardware, and performance-focused systems. Currently developing skills in Kubernetes, CPU-based" +
    "3D rendering, Rust, Arduino programming and Agrentic development." +
    "Education\n" + 
    "University of Warwick\n" +
    "BSc Mathematics First-Class Honours\n" +
    "Experience\n" +
    "Software Developer\n" +
    "Dorset Software\n" +
    "2020-2024\n" +
    "May 2025-present\n" +
    "Collaborated in a four-developer team to design and implement a full-stack web application comprising a Blazor"

    cvText = cvText.toUpperCase();
    const rows = []

    let currentRowCharCount = 0
    let currentRowStartIndex = 0
    for (let textIndex = 0; textIndex < cvText.length; textIndex++){
        currentRowCharCount++;
        const currentChar = cvText[textIndex];
        if ((currentChar == "\n") || (currentChar == " " && currentRowCharCount > rowCharLength)){
            const currentRow = cvText.substring(currentRowStartIndex, textIndex)
            rows.push(currentRow)
            currentRowStartIndex = textIndex + 1;
            currentRowCharCount = 0;
        }
    }

    const currentRow = cvText.substring(currentRowStartIndex)
    rows.push(currentRow)
            
    return rows;
}