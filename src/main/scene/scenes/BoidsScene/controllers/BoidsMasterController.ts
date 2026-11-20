import { Updatable } from "../../../../app/Updatable";
import { Matrix3, Vec3 } from "../../../../maths";
import { xBoidLowerBound, xBoidUpperBound, zBoidLowerBound, zBoidUpperBound } from "../../../../utils/constants";
import { Boid } from "../game-objects/Boid";
import { IndividualBoidController } from "./IndividualBoidController";

export class BoidsMasterController implements Updatable {
    controllers: IndividualBoidController[] = []
    boids: Boid[] = []
    forwards: Vec3[] = []
    cntBoids = new Array<number>(numOfCells).fill(0);

    orderedBoidsIndex: number[]
    boidCell: number[]

    setControllers(controllers: IndividualBoidController[]) {
        this.controllers = controllers;
        this.boids = this.controllers.map(controller => controller.targets[0])
        this.orderedBoidsIndex = new Array<number>(this.boids.length)
        this.boidCell = new Array<number>(this.boids.length)
        this.forwards = new Array<Vec3>(this.boids.length)
    }

    getGridIndex(boid: Boid){
        return Math.floor(boid.transform.position.x / cellSize) + (Math.floor(boid.transform.position.z / cellSize) * gridWidth)
    }

    update(dt: number) {
        const controllers = this.controllers;
        const boids = this.boids;
        const forwards = this.forwards;
        
        const boidsLength = boids.length;

        // ORDER BOIDS AND FORM CELL START ARRAY
        // Assume bounds are 0 and xBoidUpperBound + xBoidLowerBound for x Axis
        const cntBoids = this.cntBoids.fill(0);
        
        const orderedBoidsIndex = this.orderedBoidsIndex;
        const boidCell = this.boidCell;
        
        for (let i = 0; i < boidsLength; i++){
            const boid = boids[i]
            const gridIndex = this.getGridIndex(boid)
            cntBoids[gridIndex] += 1;
            boidCell[i] = gridIndex;
            
            forwards[i] = {x: boid.transform.orientation[0][2], y: boid.transform.orientation[1][2], z: boid.transform.orientation[2][2]}
        }

        for (let i = 1; i < cntBoids.length; i++){
            cntBoids[i] += cntBoids[i - 1]
        }

        for (let i = boidsLength - 1; i >= 0; i--){
            const cellIndex = boidCell[i]

            orderedBoidsIndex[cntBoids[cellIndex] - 1] = i
            cntBoids[cellIndex] -= 1;
        }

        const boidIndicesInSurroundingCells: number[] = [];
        let cellIndex = -1

        // loop each boid
        for (let boidIndex of orderedBoidsIndex){
            const boidTransformPosition = boids[boidIndex].transform.position;
            const currentCellIndex = boidCell[boidIndex]
            const forward = forwards[boidIndex]

            // if next boid is not in the same cell as the previous boid
            if (cellIndex != currentCellIndex){
                cellIndex = currentCellIndex;

                // build 3x3 grid of cells
                boidIndicesInSurroundingCells.length = 0
                for (let middleCellIndexOnRow of [currentCellIndex - gridWidth, currentCellIndex, currentCellIndex + gridWidth]){
                    const startIndex = cntBoids[middleCellIndexOnRow - 1]
                    const endIndex = cntBoids[middleCellIndexOnRow + 2]

                    for (let surroundingBoidIndex = startIndex; surroundingBoidIndex < endIndex; surroundingBoidIndex++){
                        boidIndicesInSurroundingCells.push(orderedBoidsIndex[surroundingBoidIndex])    
                    }
                }
            }

            let center = boids[boidIndex].transform.position;
            let coherenceAngle = 0;
            let separationAngle = 0
            let alignmentAngle = 0;
            let boundsAngle = 0;
            let numOfNeighbours = 0

            // loop each other boid within the surrounding cells
            for (let otherBoidIndex of boidIndicesInSurroundingCells){
                if (otherBoidIndex == boidIndex) continue
                
                const otherBoidPosition = boids[otherBoidIndex].transform.position;

                const offset = Vec3.subtract(otherBoidPosition, boidTransformPosition);
                const distanceSqrd = Vec3.dot(offset, offset)
                if ( distanceSqrd < visualRangeSquared) {
                    center = Vec3.add(center, otherBoidPosition)
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

            // average the center, the separation and alignment angle num of neighbours
            if (numOfNeighbours > 0){
                center = Vec3.scale(center, 1/(numOfNeighbours + 1))
                const coherenceToTarget = Vec3.normalise(Vec3.subtract(center, boidTransformPosition))
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

            if (boidTransformPosition.x < xBoidLowerBound) desired.x += 1;
            else if (boidTransformPosition.x > xBoidUpperBound) desired.x -= 1;

            if (boidTransformPosition.z < zBoidLowerBound) desired.z += 1;
            else if (boidTransformPosition.z > zBoidUpperBound) desired.z -= 1;

            if (desired.x != 0 || desired.z != 0) {
                if (desired.x != 0 && desired.z != 0) {
                    desired.x = desired.x / Math.sqrt(2);
                    desired.z = desired.z / Math.sqrt(2);
                }

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
const visualRangeSquared = visualRange * visualRange;
// const visualRange = xBoidUpperBound / 40;

const coherenceWeight = 1.5;
const separationWeight = 1;
const alignmentWeight = 1;
const boundsWeight = 20;
const dtCorrection = 50;

const cellSize = Math.ceil(visualRange);

const gridWidth = (xBoidUpperBound + (xBoidLowerBound * 2)) / cellSize
const gridHeight = (zBoidUpperBound + (zBoidLowerBound * 2)) / cellSize
const numOfCells = gridWidth * gridHeight

const EPS = 0.001;
