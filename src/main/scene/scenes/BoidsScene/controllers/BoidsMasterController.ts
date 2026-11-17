import { Updatable } from "../../../../app/Updatable";
import { Matrix3, Vec3 } from "../../../../maths";
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
        const controllers = this.controllers;
        const boids = this.boids;
        const forwards = boids.map(boid => Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1})))

        const grid = new Map<string, number[]>();
        const cellSize = visualRange;

        // Store all boid indices in the grid
        for (let i = 0; i < controllers.length; i++){
            const boid = boids[i]
            const gridKey = `${Math.floor(boid.transform.position.x / cellSize)},${Math.floor(boid.transform.position.y / cellSize)},${Math.floor(boid.transform.position.z / cellSize)}`
            if (!grid.has(gridKey))
                 grid.set(gridKey, [])

            grid.get(gridKey).push(i);
        }

        for (let i = 0; i < controllers.length; i++){
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

                            const separationToTarget = Vec3.scale(offset, distanceSqrdInverse)
                            
                            const separationCrossY = forward.z * separationToTarget.x - forward.x * separationToTarget.z

                            if (Math.abs(separationCrossY) < EPS) {
                                const dot = Vec3.dot(forward, separationToTarget)
                                alignmentAngle -= dot < 0 ? distanceSqrdInverse * Math.PI : 0
                            }
                            else {
                                alignmentAngle -= (distanceSqrdInverse) * separationCrossY * Math.PI
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
                            numOfNeighbours++;
                        }
                        
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

            if (boid.transform.position.x < 0) desired.x += 1;
            else if (boid.transform.position.x > BoidXBound) desired.x -= 1;

            if (boid.transform.position.z < 0) desired.z += 1;
            else if (boid.transform.position.z > BoidZBound) desired.z -= 1;

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
            controllers[i].intent.yaw = correctYaw * dt * dtCorrection;
        }
    }
}

const coherenceWeight = 1;
const separationWeight = 0.3;
const alignmentWeight = 1;
const boundsWeight = 10;

const dtCorrection = 50;

const visualRange = BoidXBound / 40;
const EPS = 0.001;
