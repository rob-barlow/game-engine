import { Matrix3, Vec2, Vec3 } from "../../../../maths";
import { Intent } from "../../../../maths/Intent";
import { BoidXBound, BoidZBound } from "../../../../utils/constants";
import { Boid } from "../game-objects/Boid";
import { IndividualBoidController } from "./IndividualBoidController";

export class BoidsMasterController {
    controllers: IndividualBoidController[] = []
    boids: Boid[] = []
    intents: Intent[] = []
    setControllers(controllers: IndividualBoidController[]) {
        this.controllers = controllers;
        let intent = Intent.empty();
        intent.zDirection = 1;
        this.intents = new Array(controllers.length);
        for (let i = 0; i < controllers.length; i++){
            this.intents[i] = {
                xDirection: 0,
                yDirection: 0,
                zDirection: 1,
                yaw: 0,
                pitch: 0,
                roll: 0
            };
        }

        this.boids = this.controllers.map(controller => controller.targets[0])
    }

    getIntent(controller: IndividualBoidController){
        const index = this.controllers.indexOf(controller);
        if (index !== -1) {
            if (index == 0){
                this.updateIntents();
            }
            return this.intents[index];
        }
        return Intent.empty();
    }

    updateIntents() {
        // Coherence
        const boids = this.boids;
        const forwards = boids.map(boid => Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1})))

        const grid = new Map<string, Boid[]>();
        const cellSize = visualRange;

        // Store all boids in the grid
        for (let i = 0; i < this.controllers.length; i++){
            const boid = boids[i]
            const gridKey = `${Math.floor(boid.transform.position.x / cellSize)},${Math.floor(boid.transform.position.y / cellSize)},${Math.floor(boid.transform.position.z / cellSize)}`
            if (!grid.has(gridKey))
                 grid.set(gridKey, [])

            grid.get(gridKey).push(boid);
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

                    const cellBoids = grid.get(key);

                    if (!cellBoids) continue;

                    for (const other of cellBoids) {
                        const offset = Vec3.subtract(other.transform.position, boid.transform.position);
                        const distanceSqrd = Vec3.dot(offset, offset)
                        if ( distanceSqrd < visualRange * visualRange && distanceSqrd != 0) {
                            center = Vec3.add(center, other.transform.position)

                            // Separation
                            const separationToTarget = Vec3.normalise(offset)
                            
                            const separationDot = Vec3.dot(forward, separationToTarget);

                            const separationCross = Vec3.cross(forward, separationToTarget);

                            separationAngle -= (1/distanceSqrd) * Math.atan2(separationCross.y, separationDot); // 2 
                        
                            // Alignment
                            const otherForward = forwards[boids.indexOf(other)] // 1

                            const alignmentDot = Vec3.dot(forward, otherForward);

                            const alignmentCross = Vec3.cross(forward, otherForward);

                            alignmentAngle += (1/distanceSqrd) * Math.atan2(alignmentCross.y, alignmentDot); // 3
                            numOfNeighbours++;
                        }
                        
                    }
                }
            }
            
            if (numOfNeighbours > 0){
                center = Vec3.scale(center, 1/(numOfNeighbours + 1))
    
                const coherenceToTarget = Vec3.normalise(Vec3.subtract(center, boid.transform.position))
                const coherenceDot = Vec3.dot(forward, coherenceToTarget);
    
                const coherenceCross = Vec3.cross(forward, coherenceToTarget);
    
                coherenceAngle += Math.atan2(coherenceCross.y, coherenceDot);
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
                const dot = Vec3.dot(forward, desired);

                const cross = Vec3.cross(forward, desired);

                boundsAngle += Math.atan2(cross.y, dot);
            }

            const a = coherenceAngle * coherenceWeight
            const b = separationAngle * separationWeight
            const c = alignmentAngle * alignmentWeight
            const d = boundsAngle * boundsWeight

            const correctYaw = Math.max(Math.min(a + b + c + d, Math.PI/2), -Math.PI/2);
            this.intents[i].yaw = correctYaw
        }
    }
}

const coherenceWeight = 0.5;
const separationWeight = 0.5;
const alignmentWeight = 2;
const boundsWeight = 10;

const visualRange = BoidXBound / 20;
