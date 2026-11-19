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
        // (floor x * range of possible x values) + floor z
        const cellSize = visualRange;
        return (Math.floor(boid.transform.position.x) * (xBoidUpperBound + (xBoidLowerBound * 2))) + Math.floor(boid.transform.position.z)
    }

    update(dt: number) {
        const controllers = this.controllers;
        const boids = this.boids;
        const boidsLength = boids.length;
        const numOfCells = (xBoidUpperBound + (xBoidLowerBound * 2)) * (zBoidUpperBound + (zBoidLowerBound * 2))
        const forwards = boids.map(boid => Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1})))

        const cellSize = visualRange;

        // Assume bounds are 0 and xBoidUpperBound + xBoidLowerBound for x Axis
        const stride = xBoidUpperBound + (xBoidLowerBound * 2)
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

        // loop each cell
        for (let currentCellIndex = 0; currentCellIndex < numOfCells; currentCellIndex++){
            const sortedBoidStartIndex = cellStart[currentCellIndex]
            const sortedBoidEndIndex = cellStart[currentCellIndex + 1]

            // if no boid in cell, continue
            if (sortedBoidStartIndex == -1 || sortedBoidEndIndex == -1) continue
            
            const boidIndicesInCurrentCell = orderedBoidsIndex.slice(sortedBoidStartIndex, sortedBoidEndIndex);

            const boidIndicesInSurroundingCells = [];
            // build 3x3 grid of cells
            for (let middleCellIndexOnRow of [currentCellIndex - stride, currentCellIndex, currentCellIndex + stride]){
                if (cellStart[middleCellIndexOnRow] == -1 && cellStart[middleCellIndexOnRow + 1] == -1) continue

                let startIndex = 0;
                let endIndex = 0;
                for (let z = 0; z < 3; z++){
                    startIndex = cellStart[middleCellIndexOnRow + 1 - z] != -1 ? cellStart[middleCellIndexOnRow + 1 - z] : startIndex
                    endIndex = cellStart[middleCellIndexOnRow + z] != -1 ? cellStart[middleCellIndexOnRow + z] : endIndex
                }

                boidIndicesInSurroundingCells.push(...orderedBoidsIndex.slice(startIndex, endIndex))
            }

            let numOfNeighbours = boidIndicesInSurroundingCells.length - 1;

            // loop each boid within the cell
            for (let boidInCellIndex = 0; boidInCellIndex < boidIndicesInCurrentCell.length; boidInCellIndex++){
                const boidIndex = boidIndicesInCurrentCell[boidInCellIndex]
                const boid = boids[boidIndex]
                const forward = forwards[boidIndex]

                let center = boid.transform.position;
                let coherenceAngle = 0;
                let separationAngle = 0
                let alignmentAngle = 0;
                let boundsAngle = 0;

                // loop each other boid within the cell
                for (let otherBoidInCellIndex = 0; otherBoidInCellIndex < boidIndicesInSurroundingCells.length; otherBoidInCellIndex++){
                    const otherBoidIndex = boidIndicesInSurroundingCells[otherBoidInCellIndex]
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
}

const coherenceWeight = 1;
const separationWeight = 0.5;
const alignmentWeight = 1;
const boundsWeight = 20;

const dtCorrection = 50;

const visualRange = xBoidUpperBound / 40;
// const gridStride = xBoidUpperBound * 2
const EPS = 0.001;
