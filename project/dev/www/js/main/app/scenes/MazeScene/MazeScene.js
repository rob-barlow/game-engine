import { generateMaze } from "../../../../maze-generator/generateMaze.js";
import { Matrix3 } from "../../../maths/index.js";
import Boundary from "../../../scene/game-objects/Boundary.js";
import { Panel } from "../../../scene/game-objects/Panel.js";
import { Scene } from "../../../scene/Scene.js";
import { addPlayer } from "../Extensions.js";
import MazePanelTypes from "./MazePanelTypes.js";
export function createMazeScene() {
    const mazeWidth = 20;
    const mazeHeight = 20;
    const scene = new Scene();
    const startPosition = addMaze(scene, mazeWidth, mazeHeight);
    const playerController = addPlayer(scene, startPosition);
    return { scene: scene, controllers: [playerController] };
}
const floorColour = [180, 180, 180];
const ceilingColour = [240, 240, 240];
const leftWallColour = [0, 0, 255];
const rightWallColour = [0, 255, 0];
const frontWallColour = [255, 0, 0];
const backWallColour = [255, 255, 0];
function addMaze(scene, mazeWidth, mazeHeight) {
    const { seed, maze } = generateMaze(mazeWidth, mazeHeight);
    const panels = [];
    const flatPanels = [];
    const boundaries = [];
    let startPositionX = 0;
    let startPositionZ = 0;
    const floorPanelTransform = {
        position: { x: 1, y: -0.01, z: 1 },
        orientation: Matrix3.identity(),
        scale: { x: 2 * maze[0].length, y: 1, z: 2 * maze.length }
    };
    flatPanels.push(new Panel(floorPanelTransform, floorColour));
    const ceilingPanelTransform = {
        position: { x: 2 * maze[0].length - 1, y: 3.99, z: 1 },
        orientation: Matrix3.multiply(Matrix3.getRotationMatrix('z', Math.PI), Matrix3.identity()),
        scale: { x: 2 * maze[0].length, y: 1, z: 2 * maze.length }
    };
    flatPanels.push(new Panel(ceilingPanelTransform, ceilingColour));
    for (let rowIndex = 0; rowIndex < maze.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < maze[rowIndex].length; columnIndex++) {
            // x = row, z = column
            if (maze[rowIndex][columnIndex] == 0 || maze[rowIndex][columnIndex] == 2 || maze[rowIndex][columnIndex] == 3) {
                // add wall between this and all 1s
                if (maze[rowIndex - 1][columnIndex] == 1) {
                    panels.push(...getPanelsWrapper(2 * rowIndex, 0, [2 * columnIndex, 2 * columnIndex + 1], 'X', leftWallColour));
                }
                if (maze[rowIndex + 1][columnIndex] == 1) {
                    panels.push(...getPanelsWrapper(2 * rowIndex + 2, 0, [2 * columnIndex, 2 * columnIndex + 1], '-X', rightWallColour));
                }
                if (maze[rowIndex][columnIndex - 1] == 1) {
                    panels.push(...getPanelsWrapper([2 * rowIndex, 2 * rowIndex + 1], 0, 2 * columnIndex, 'Z', frontWallColour));
                }
                if (maze[rowIndex][columnIndex + 1] == 1) {
                    panels.push(...getPanelsWrapper([2 * rowIndex, 2 * rowIndex + 1], 0, 2 * columnIndex + 2, '-Z', backWallColour));
                }
            }
            if (maze[rowIndex][columnIndex] == 1) {
                let boundaryTransform = {
                    position: { x: 2 * rowIndex, y: 0, z: 2 * columnIndex },
                    orientation: Matrix3.identity(),
                    scale: { x: 2, y: 4, z: 2 }
                };
                boundaries.push(new Boundary(boundaryTransform));
            }
            if (maze[rowIndex][columnIndex] == 2) {
                startPositionX = 2 * rowIndex + 1;
                startPositionZ = 2 * columnIndex + 1;
            }
            if (maze[rowIndex][columnIndex] == 3) {
                flatPanels.push(...getPanelsWrapper([2 * rowIndex, 2 * rowIndex + 1], 0, [2 * columnIndex, 2 * columnIndex + 1], 'Y', [255, 255, 255]));
            }
        }
    }
    panels.forEach(panel => {
        panel.transform.scale.y = 4;
        scene.add(panel);
    });
    flatPanels.forEach(panel => {
        panel.transform.scale.y = 4;
        scene.add(panel);
    });
    boundaries.forEach(boundary => {
        scene.add(boundary);
    });
    return { x: startPositionX, y: 1.5, z: startPositionZ };
}
function getPanelsWrapper(x, y, z, direction, colour = [0, 0, 255]) {
    let normal = { x: 0, y: 0, z: 0 };
    switch (direction) {
        case 'X':
            normal.x = 1;
            break;
        case '-X':
            normal.x = -1;
            break;
        case 'Y':
            normal.y = 1;
            break;
        case '-Y':
            normal.y = -1;
            break;
        case 'Z':
            normal.z = 1;
            break;
        case '-Z':
            normal.z = -1;
            break;
    }
    const xRange = typeof (x) == "number" ? [x, x] : x;
    const yRange = typeof (y) == "number" ? [y, y] : y;
    const zRange = typeof (z) == "number" ? [z, z] : z;
    return getPanels(xRange, yRange, zRange, normal, colour);
}
function getPanels(xRange, yRange, zRange, normal, colour = [0, 0, 255]) {
    const panels = [];
    let position;
    let panelTransform;
    for (let x = xRange[0]; x <= xRange[1]; x++) {
        for (let y = yRange[0]; y <= yRange[1]; y++) {
            for (let z = zRange[0]; z <= zRange[1]; z++) {
                position = { x: x, y: y, z: z };
                panelTransform = MazePanelTypes.getPanelTransform(position, normal);
                // maybe attach collision here
                panels.push(new Panel(panelTransform, colour));
            }
        }
    }
    return panels;
}
