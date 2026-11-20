import { Updatable } from "../../../../app/Updatable";
import { Matrix3, Vec3 } from "../../../../maths";
import { xBoidLowerBound, xBoidUpperBound, zBoidLowerBound, zBoidUpperBound } from "../../../../utils/constants";
import { Boid } from "../game-objects/Boid";
import { IndividualBoidController } from "./IndividualBoidController";

export class BoidsMasterController implements Updatable {
    controllers: IndividualBoidController[] = []
    boids: Boid[] = []

    setControllers(controllers: IndividualBoidController[]) {
        this.controllers = controllers;
        this.boids = this.controllers.map(controller => controller.targets[0])
    }

    getGridIndex(boid: Boid){
        return Math.floor(boid.transform.position.x / cellSize) + (Math.floor(boid.transform.position.z / cellSize) * gridWidth)
    }

    update(dt: number) {
        const controllers = this.controllers;
        const boids = this.boids;
        const boidsLength = boids.length;
        const forwards = boids.map(boid => Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1})))

        // ORDER BOIDS AND FORM CELL START ARRAY
        // Assume bounds are 0 and xBoidUpperBound + xBoidLowerBound for x Axis
        const cntBoids = new Array<number>(numOfCells).fill(0);
        const orderedBoidsIndex = new Array<number>(boidsLength).fill(0);
        const cellStart = new Array<number>(numOfCells).fill(-1); 
        
        for (let i = 0; i < boidsLength; i++){
            const boid = boids[i]
            const gridIndex = this.getGridIndex(boid)
            cntBoids[gridIndex] += 1;
        }

        for (let i = 1; i < cntBoids.length; i++){
            cntBoids[i] += cntBoids[i-1]
        }

        for (let i = boidsLength - 1; i >= 0; i--){
            const boid = boids[i]
            const cellIndex = this.getGridIndex(boid)
            if (cellStart[cellIndex + 1] == -1){
                cellStart[cellIndex + 1] = cntBoids[cellIndex];
            }
            
            cellStart[cellIndex] = cntBoids[cellIndex] - 1;

            orderedBoidsIndex[cntBoids[cellIndex] - 1] = i
            cntBoids[cellIndex] -= 1;
        }

        const boidIndicesInSurroundingCells: number[] = [];
        // const boidIndicesInCurrentCell: number[] = [];

        let cellIndex = 0

        // loop each boid
        for (let boidIndex of orderedBoidsIndex){
            let boid = boids[boidIndex]
            let currentCellIndex = this.getGridIndex(boid);

            if (cellIndex != currentCellIndex){
                cellIndex = currentCellIndex;

                // build 3x3 grid of cells
                boidIndicesInSurroundingCells.length = 0
                for (let middleCellIndexOnRow of [currentCellIndex - gridWidth, currentCellIndex, currentCellIndex + gridWidth]){
                    if (cellStart[middleCellIndexOnRow] == -1 && cellStart[middleCellIndexOnRow + 1] == -1) continue

                    let startIndex = 0;
                    let endIndex = 0;

                    // if cell on far right, dont check for stuff in the cell to the right.
                    if ((middleCellIndexOnRow + 1) % gridWidth == 0) {
                        startIndex = cellStart[middleCellIndexOnRow - 1] != -1 ? cellStart[middleCellIndexOnRow - 1] : cellStart[middleCellIndexOnRow]
                        endIndex = cellStart[middleCellIndexOnRow + 1]
                    }
                    else if ((middleCellIndexOnRow) % gridWidth == 0) {
                        startIndex = cellStart[middleCellIndexOnRow]
                        endIndex = cellStart[middleCellIndexOnRow + 2] != -1 ? cellStart[middleCellIndexOnRow + 2] : cellStart[middleCellIndexOnRow + 1]
                    }
                    else {
                        for (let z = 0; z < 3; z++){
                            startIndex = cellStart[middleCellIndexOnRow + 1 - z] != -1 ? cellStart[middleCellIndexOnRow + 1 - z] : startIndex
                            endIndex = cellStart[middleCellIndexOnRow + z] != -1 ? cellStart[middleCellIndexOnRow + z] : endIndex
                        }
                    }

                    boidIndicesInSurroundingCells.push(...orderedBoidsIndex.slice(startIndex, endIndex))
                }
            }

            const forward = forwards[boidIndex]

            let center = boid.transform.position;
            let coherenceAngle = 0;
            let separationAngle = 0
            let alignmentAngle = 0;
            let boundsAngle = 0;
            let numOfNeighbours = 0

            // loop each other boid within the surrounding cells
            for (let otherBoidIndex of boidIndicesInSurroundingCells){
                if (otherBoidIndex == boidIndex) continue
                
                const otherBoid = boids[otherBoidIndex];

                const offset = Vec3.subtract(otherBoid.transform.position, boid.transform.position);
                const distanceSqrd = Vec3.dot(offset, offset)
                if ( distanceSqrd < visualRange * visualRange && distanceSqrd != 0) {
                    center = Vec3.add(center, otherBoid.transform.position)
                    const distanceSqrdInverse = 1/distanceSqrd;

                    const separationToTarget = Vec3.scale(offset, distanceSqrdInverse)
                    
                    const separationCrossY = forward.z * separationToTarget.x - forward.x * separationToTarget.z

                    if (Math.abs(separationCrossY) < EPS) {
                        const dot = Vec3.dot(forward, separationToTarget)
                        separationAngle -= dot < 0 ? distanceSqrdInverse * Math.PI : 0
                    }
                    else {
                        separationAngle -= (distanceSqrdInverse) * separationCrossY * Math.PI
                    }
                    
                    const otherForward = forwards[otherBoidIndex]

                    const alignmentCrossY = forward.z * otherForward.x - forward.x * otherForward.z

                    if (Math.abs(alignmentCrossY) < EPS) {
                        const dot = Vec3.dot(forward, otherForward)
                        alignmentAngle += dot < 0 ? distanceSqrdInverse * Math.PI : 0
                    }
                    else {
                        alignmentAngle += (distanceSqrdInverse) * alignmentCrossY * Math.PI
                    }
                    numOfNeighbours++
                }
            }

            if (numOfNeighbours > 0){
                center = Vec3.scale(center, 1/(numOfNeighbours + 1))
                const coherenceToTarget = Vec3.normalise(Vec3.subtract(center, boid.transform.position))
                const coherenceCrossY = forward.z * coherenceToTarget.x - forward.x * coherenceToTarget.z
    
                if (Math.abs(coherenceCrossY) < EPS) {
                    const dot = Vec3.dot(forward, coherenceToTarget)
                    coherenceAngle += dot < 0 ? Math.PI : 0
                }
                else {
                    coherenceAngle += coherenceCrossY * Math.PI
                }

                alignmentAngle /= numOfNeighbours;
                separationAngle /= numOfNeighbours;
            }

            // keep in bound
            let desired = {x:0,y:0,z:0};

            if (boid.transform.position.x < xBoidLowerBound) desired.x += 1;
            else if (boid.transform.position.x > xBoidUpperBound) desired.x -= 1;

            if (boid.transform.position.z < zBoidLowerBound) desired.z += 1;
            else if (boid.transform.position.z > zBoidUpperBound) desired.z -= 1;

            if (desired.x != 0 && desired.z != 0) {
                desired.x = desired.x / Math.sqrt(2);
                desired.z = desired.z / Math.sqrt(2);
            }

            if (desired.x != 0 || desired.z != 0) {
                // Steer together
                const crossY = forward.z * desired.x - forward.x * desired.z

                if (Math.abs(crossY) < EPS) {
                    const dot = Vec3.dot(forward, desired)
                    boundsAngle = dot < 0 ? Math.PI : 0
                }
                else {
                    boundsAngle = crossY * Math.PI
                }
            }

            const a = coherenceAngle * coherenceWeight
            const b = separationAngle * separationWeight
            const c = alignmentAngle * alignmentWeight
            const d = boundsAngle * boundsWeight

            const correctYaw = Math.max(Math.min(a + b + c + d, Math.PI/2), -Math.PI/2);
            controllers[boidIndex].intent.yaw = correctYaw * dt * dtCorrection;
        }
    }
}


const visualRange = 1;
// const visualRange = xBoidUpperBound / 40;

const coherenceWeight = 1;
const separationWeight = 0.5;
const alignmentWeight = 1;
const boundsWeight = 20;
const dtCorrection = 50;

const cellSize = Math.ceil(visualRange);

const gridWidth = (xBoidUpperBound + (xBoidLowerBound * 2)) / cellSize
const gridHeight = (zBoidUpperBound + (zBoidLowerBound * 2)) / cellSize
const numOfCells = gridWidth * gridHeight

const EPS = 0.001;
