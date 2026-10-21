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
    let cvText = `Rob Barlow

Manchester, UK • +44 7443 465775 • robert.barlow2003@icloud.com • github.com/rob-barlow • robdev.uk

Summary

Software Developer specialising in full-stack application development with C#, .NET, ASP.NET Core, and modern web technologies. Experienced in collaborating within development teams, communicating technical concepts clearly, and contributing across the software development lifecycle. Particularly interested in networking, low-level programming, hardware, and performance-focused systems. Currently developing skills in Kubernetes, CPU-based 3D rendering, Rust, Arduino programming and Agentic development.

Education

University of Warwick (2020-2024)

BSc Mathematics - First-Class Honours

Experience
Software Developer

Dorset Software | May 2025-Present

Collaborated in a four-developer team to design and implement a full-stack web application comprising a Blazor frontend, ASP.NET Core backend, OIDC server integration, API microservice, CMS integration, background processing services, and Azure Service Bus messaging. The application supported 240 radiologists across more than 100 hospitals, helping improve workflow accuracy and enable faster responses to emergencies identified in scans.
Developed and maintained full-stack applications for external clients as a software consultant, contributing across design, implementation, testing, deployment, and troubleshooting.
Migrated and optimised a PostgreSQL database schema from Liquibase to Entity Framework Core, improving backend-database integration and simplifying migration and rollback workflows.
Designed and built a custom external application integrating with a CMS, extending its functionality and improving usability for end users.
Investigated and resolved issues across multiple deployments, helping maintain reliable application delivery.
Implemented improvements to Azure Container Registry workflows to enhance developer experience and reduce blocking errors.
Created and maintained xUnit unit tests to support regression testing and improve confidence in ongoing development.
Technical Skills

Languages: C#, JavaScript, SQL, HTML5, CSS3, Bash, Rust

Frameworks & Libraries: .NET, ASP.NET Core, Entity Framework Core, React, Blazor, Serilog

Web Technologies: REST APIs, HTTP/HTTPS, WebSockets, JSON, OAuth, Swagger, OpenAPI

Databases: Microsoft SQL Server, PostgreSQL

Testing: xUnit, NUnit, Selenium

DevOps & Tools: Git, Docker, Bitbucket Pipelines, CI/CD, Seq, Jira

Operating Systems: Windows, Linux

Embedded Development: Arduino

Familiar With

Languages: Python, PHP, Swift, Batch

Infrastructure & Messaging: Kubernetes, RabbitMQ, Azure Service Bus, Azure Container Registry

Embedded Development: ESP32

Projects
3D CPU Renderer

Built a browser-based 3D game engine from scratch, implementing triangle rasterisation, depth buffering, camera projection, and per-pixel rendering. Initially developed in TypeScript, with an ongoing migration to Rust compiled to WebAssembly.

Command-Line Chat Application

Developed a Bash-based chat application using named pipes to manage a WebSocket connection and encode, decode, and transmit WebSocket frames. Built a CLI extension supporting separate one-to-one and group chats.`;

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