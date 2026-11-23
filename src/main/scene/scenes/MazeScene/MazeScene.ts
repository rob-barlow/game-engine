import { generateMaze } from "../../../../maze-generator/generateMaze";
import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import Boundary from "../../game-objects/Boundary";
import { Panel } from "../../game-objects/Panel";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";
import { PostProcessingOptions } from "../../../rendering/gpu/PostProcessingOptions";
import Texture from "../../../meshes/Textures/Textures";

export function createMazeScene(): {scene: Scene, controllers: Controller[]} {
    const mazeWidth = 10;
    const mazeHeight = 10;

    const scene = new Scene();
    scene.postProcessingOptions = [
        PostProcessingOptions.Flashlight,
        // PostProcessingOptions.Pixelation,
        PostProcessingOptions.Grayscale,
        // PostProcessingOptions.Kernel
    ]

    const startPosition = addMaze(scene, mazeWidth, mazeHeight);
    
    const playerController = addPlayer(scene, startPosition);

    return {scene: scene, controllers: [playerController]};
}

const floorColour: [number, number, number] = [180,180,180]
const ceilingColour: [number, number, number] = [240,240,240]
const leftWallColour: [number, number, number] = [0,0,255]
const rightWallColour: [number, number, number] = [0,255, 0]
const frontWallColour: [number, number, number] = [255,0,0]
const backWallColour: [number, number, number] = [255,255,0]


const minusZOrientation: Matrix3 = Matrix3.getRotationMatrix('x', -Math.PI/2)

const leftWallOrientation: Matrix3 = Matrix3.multiply(Matrix3.getRotationMatrix('y', -Math.PI/2), minusZOrientation)
const leftWallScale: Vec3 = {x: 1, y: 4, z: 2}

const rightWallOrientation: Matrix3 = Matrix3.multiply(Matrix3.getRotationMatrix('y', Math.PI/2), minusZOrientation)
const rightWallScale: Vec3 = {x: 1, y: 4, z: 2}

const frontWallOrientation: Matrix3 = Matrix3.multiply(Matrix3.getRotationMatrix('y', Math.PI), minusZOrientation)
const frontWallScale: Vec3 = {x: 2, y: 4, z: 1}

const backWallOrientation: Matrix3 = minusZOrientation
const backWallScale: Vec3 = {x: 2, y: 4, z: 1}

const floorOrientation: Matrix3 = Matrix3.identity()
const floorScale: Vec3 = {x: 2, y: 1, z: 2}

const ceilingOrientation: Matrix3 = Matrix3.getRotationMatrix('x', Math.PI)
const ceilingScale: Vec3 = {x: 2, y: 1, z: 2}

function addMaze(scene: Scene, mazeWidth: number, mazeHeight: number){
    const {seed, maze} = generateMaze(mazeWidth, mazeHeight);

    const panels: Panel[] = []
    const flatPanels: Panel[] = []

    const boundaries: Boundary[] = []

    let startPositionX = 0
    let startPositionZ = 0


    // add walls
    for (let rowIndex = 0; rowIndex < maze.length; rowIndex++){
        for (let columnIndex = 0; columnIndex < maze[rowIndex].length; columnIndex++){
            // x = row, z = column
            if (maze[rowIndex][columnIndex] == 0 || maze[rowIndex][columnIndex] == 2 || maze[rowIndex][columnIndex] == 3){
                // add wall between this and all 1s
                const floorTransform: Transform = {
                    position: {x: 2 * rowIndex, y: 0, z: 2 * columnIndex},
                    orientation: floorOrientation,
                    scale: floorScale
                }
                const floorPanel = new Panel(floorTransform, floorColour);
                flatPanels.push(floorPanel);

                const ceilingTransform: Transform = {
                    position: {x: 2 * rowIndex, y: 4, z: 2 * columnIndex + 2},
                    orientation: ceilingOrientation,
                    scale: ceilingScale
                }
                const ceilingPanel = new Panel(ceilingTransform, ceilingColour);
                flatPanels.push(ceilingPanel);

                // left wall
                if (maze[rowIndex - 1][columnIndex] == 1){
                    const transform: Transform = {
                        position: {x: 2 * rowIndex, y: 0, z: 2 * columnIndex},
                        orientation: leftWallOrientation,
                        scale: leftWallScale
                    }
                    const panel = new Panel(transform, leftWallColour);
                    panels.push(panel)
                }
                // right wall
                if (maze[rowIndex + 1][columnIndex] == 1){
                    const transform: Transform = {
                        position: {x: 2 * rowIndex + 2, y: 0, z: 2 * columnIndex + 2},
                        orientation: rightWallOrientation,
                        scale: rightWallScale
                    }
                    const panel = new Panel(transform, rightWallColour);
                    panels.push(panel)
                }
                // front wall
                if (maze[rowIndex][columnIndex - 1] == 1){
                    const transform: Transform = {
                        position: {x: 2 * rowIndex + 2, y: 0, z: 2 * columnIndex},
                        orientation: frontWallOrientation,
                        scale: frontWallScale
                    }
                    const panel = new Panel(transform, frontWallColour);
                    panels.push(panel)
                }
                // back wall
                if (maze[rowIndex][columnIndex + 1] == 1){
                    const transform: Transform = {
                        position: {x: 2 * rowIndex, y: 0, z: 2 * columnIndex + 2},
                        orientation: backWallOrientation,
                        scale: backWallScale
                    }
                    const panel = new Panel(transform, backWallColour);
                    panels.push(panel)
                }
            }

            // add collisions
            if (maze[rowIndex][columnIndex] == 1){
                let boundaryTransform: Transform = {
                    position: {x: 2 * rowIndex, y: 0, z: 2 * columnIndex},
                    orientation: Matrix3.identity(),
                    scale: {x: 2, y: 4, z: 2}
                }

                boundaries.push(new Boundary(boundaryTransform))
            }

            // set start point
            if (maze[rowIndex][columnIndex] == 2){
                startPositionX = 2 * rowIndex + 1
                startPositionZ = 2 * columnIndex + 1
            }

            // add finishing square
            if (maze[rowIndex][columnIndex] == 3){
                const transform: Transform = {
                    position: {x: 2 * rowIndex, y: 0, z: 2 * columnIndex},
                    orientation: Matrix3.identity(),
                    scale: {x: 2, y: 1, z: 2}
                }
                const panel = new Panel(transform, [255,255,255]);
                panels.push(panel)
            }
        }
    }

    panels.forEach(panel => {
        // panel.texture = Texture.Water
        scene.add(panel)
    })

    flatPanels.filter(panel => {
        return maze[panel.transform.position.x/2][panel.transform.position.z/2] != 3 || panel.transform.position.y > 0
    }).forEach(panel => {
        panel.texture = Texture.Ceiling
        scene.add(panel)
    })

    boundaries.forEach(boundary => {
        scene.add(boundary)
    })

    return {x: startPositionX, y: 1.5, z: startPositionZ}
}

function arePanelsAdjacent(p1: Panel, p2: Panel): Boolean {
    // check if x or z are equal. if z equal, x must be equal to other x + scale (1)
    const pos1 = p1.transform.position;
    const pos2 = p2.transform.position;

    const otherSidePos1 = Vec3.add(pos1, Matrix3.apply(p1.transform.orientation, p1.transform.scale));
    const otherSidePos2 = Vec3.add(pos2, Matrix3.apply(p2.transform.orientation, p2.transform.scale));

    if (Vec3.equals(pos1, otherSidePos2) || Vec3.equals(pos2, otherSidePos1)){
        return true;
    }

    return false;
}