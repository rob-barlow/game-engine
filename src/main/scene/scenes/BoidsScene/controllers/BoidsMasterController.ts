import { Updatable } from "../../../../app/Updatable";
import { Matrix3, Vec2, Vec3 } from "../../../../maths";
import { BoidXBound, BoidZBound } from "../../../../utils/constants";
import { Boid } from "../game-objects/Boid";
import { IndividualBoidController } from "./IndividualBoidController";

export class BoidsMasterController implements Updatable {
    controllers: IndividualBoidController[] = []
    boids: Boid[] = []

    setControllers(controllers: IndividualBoidController[]) {
        this.controllers = controllers;
        this.boids = this.controllers.map(controller => controller.targets[0])
    }

    update(dt: number) {
        // Coherence
        const boids = this.boids;
        const forwards = boids.map(boid => Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1})))

        const grid = new Map<string, number[]>();
        const cellSize = visualRange;

        // Store all boid indices in the grid
        for (let i = 0; i < this.controllers.length; i++){
            const boid = boids[i]
            const gridKey = `${Math.floor(boid.transform.position.x / cellSize)},${Math.floor(boid.transform.position.y / cellSize)},${Math.floor(boid.transform.position.z / cellSize)}`
            if (!grid.has(gridKey))
                 grid.set(gridKey, [])

            grid.get(gridKey).push(i);
        }

        for (let i = 0; i < this.controllers.length; i++){
            const boid = boids[i]
            const forward = forwards[i]

            let center = boid.transform.position;
            let coherenceAngle = 0;
            let separationAngle = 0
            let alignmentAngle = 0;
            let boundsAngle = 0;
            let numOfNeighbours = 0;

            for (let dz = -1; dz <= 1; dz++) {
                for (let dx = -1; dx <= 1; dx++) {

                    const key = `${Math.floor(boid.transform.position.x / cellSize) + dx},${Math.floor(boid.transform.position.y / cellSize)},${Math.floor(boid.transform.position.z / cellSize) + dz}`;

                    const cellBoids = grid.get(key); // 2

                    if (!cellBoids) continue;

                    for (const otherBoidIndex of cellBoids) {
                        const otherBoid = boids[otherBoidIndex];
                        const offset = Vec3.subtract(otherBoid.transform.position, boid.transform.position);  // 3
                        const distanceSqrd = Vec3.dot(offset, offset)
                        if ( distanceSqrd < visualRange * visualRange && distanceSqrd != 0) {
                            center = Vec3.add(center, otherBoid.transform.position)
                            const distanceSqrdInverse = 1/distanceSqrd;

                            // Separation
                            const separationToTarget = Vec3.scale(offset, distanceSqrdInverse)
                            
                            separationAngle -= (distanceSqrdInverse) * getAngle(forward, separationToTarget); // 1
                        
                            // Alignment
                            const otherForward = forwards[otherBoidIndex]

                            alignmentAngle += (distanceSqrdInverse) * getAngle(forward, otherForward) // 1
                            numOfNeighbours++;
                        }
                        
                    }
                }
            }
            
            if (numOfNeighbours > 0){
                center = Vec3.scale(center, 1/(numOfNeighbours + 1))
                const coherenceToTarget = Vec3.normalise(Vec3.subtract(center, boid.transform.position))
    
                coherenceAngle += getAngle(forward, coherenceToTarget)
                alignmentAngle /= numOfNeighbours;
                separationAngle /= numOfNeighbours;
            }

            // keep in bound
            let desired = {x:0,y:0,z:0};

            if (boid.transform.position.x < 0) desired.x += 1;
            else if (boid.transform.position.x > BoidXBound) desired.x -= 1;

            if (boid.transform.position.z < 0) desired.z += 1;
            else if (boid.transform.position.z > BoidZBound) desired.z -= 1;

            if (desired.x != 0 || desired.z != 0) {
                boundsAngle += getAngle(forward, desired)
            }

            const a = coherenceAngle * coherenceWeight
            const b = separationAngle * separationWeight
            const c = alignmentAngle * alignmentWeight
            const d = boundsAngle * boundsWeight

            const correctYaw = Math.max(Math.min(a + b + c + d, Math.PI/2), -Math.PI/2);
            this.controllers[i].intent.yaw = correctYaw * dt * dtCorrection;
        }
    }
}

const coherenceWeight = 0.5;
const separationWeight = 0.5;
const alignmentWeight = 2;
const boundsWeight = 10;

const dtCorrection = 100;

const visualRange = BoidXBound / 20;

function getAngle(v1: Vec3, v2: Vec3){
    // dot = dot(forward, desired);
    // cross = cross(forward, desired);
    // atan(cross.y, dot);
    return Math.atan2(v1.z * v2.x - v1.x * v2.z, v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
}