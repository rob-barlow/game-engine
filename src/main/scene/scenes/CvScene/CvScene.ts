import { Controller } from "../../../controls/in-game/controllers/Controller";
import { TextController } from "./controllers/TextController";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import { GameObject } from "../../game-objects";
import { Letter } from "./game-objects/Letter";
import { TextObject } from "./game-objects/TextObject";
import { Scene } from "../../Scene";
import CvCamera from "./game-objects/CvCamera";
import { CvCameraController } from "./controllers/CvCameraController";

const letterSize = 1;
const letterScale = letterSize/7
const letterGap = 7 * letterScale;
const rowCharLength = 20;

const textStartPosition: Vec3 = {x: 0, y: 5, z: 5};

export function createCvScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();
    const angleDeg = -30
    const directionMatrix = Matrix3.getRotationMatrix("x", 2 * Math.PI * (angleDeg/360))

    const cvCameraTransform: Transform = {
        position: {x: 0, y: 0, z: 0},
        orientation: directionMatrix,
        scale: {x: 1, y: 1, z: 1}
    }
        
    const cvCamera = new CvCamera(cvCameraTransform)
    
    const cvCameraController = new CvCameraController(cvCamera)
    
    scene.add(cvCamera);
    scene.setActiveCamera(cvCamera);

    const textController = addText(scene)

    return {scene: scene, controllers: [cvCameraController, textController]};
}

function addText(scene: Scene) {
    const cvLines: string[] = getCvRows();
    const letters: Letter[] = []

    let xPosition = textStartPosition.x;
    let yPosition = textStartPosition.y;
    let zPosition = textStartPosition.z;

    for (let rowIndex = 0; rowIndex < cvLines.length; rowIndex++){
        const currentRow = cvLines[rowIndex]
        const rowStartX = -(currentRow.length * letterSize)/2;
        
        xPosition = rowStartX
        for (let charIndex = 0; charIndex < currentRow.length; charIndex++){
            const currentChar = currentRow[charIndex];

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
                scale: {x: letterScale, y: letterScale, z: letterScale},
            }

            const letter: GameObject = new Letter(letterTransform, currentChar)
            letters.push(letter)
            
            xPosition += letterGap;
        }
        
        yPosition -= letterSize + letterGap
    }

    const textTransform: Transform = {
        position: {x: textStartPosition.x, y: textStartPosition.y, z: textStartPosition.z},
            orientation: Matrix3.identity(),
            scale: {x: letterScale, y: letterScale, z: letterScale},
        }
        
    const text: GameObject = new TextObject(textTransform, letters)

    const textController = new TextController(text)

    scene.add(text)

    return textController;
}

function getCvRows(){
    let cvText = "Software Developer specialising in full-stack application development with C#, .NET, ASP.NET Core, and modern web technologies. Experienced in collaborating within development teams, communicating technical concepts clearly, and contributing across the software development lifecycle. Particularly interested in networking, low-level programming, hardware, and performance-focused systems. Currently developing skills in Kubernetes, CPU-based 3D rendering, Rust, Arduino programming and Agrentic development.\nEducation\nUniversity of Warwick\nBSc Mathematics First-Class Honours\nExperience\nSoftware Developer\nDorset Software\n2020-2024\nMay 2025-present\nCollaborated in a four-developer team to design and implement a full-stack web application comprising a Blazor";

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