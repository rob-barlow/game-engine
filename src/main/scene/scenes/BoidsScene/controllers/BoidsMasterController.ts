import { Matrix3, Vec2, Vec3 } from "../../../../maths";
import { Intent } from "../../../../maths/Intent";
import { BoidXBound, BoidZBound } from "../../../../utils/constants";
import { Panel } from "../../../game-objects/Panel";
import { Boid } from "../game-objects/Boid";
import { IndividualBoidController } from "./IndividualBoidController";

const coherence = 1;

export class BoidsMasterController {
    controllers: IndividualBoidController[] = []
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
        const boids = this.controllers.map(controller => controller.targets[0])

        const grid = new Map<string, Boid[]>();
        const cellSize = visualRange;

        for (let i = 0; i < this.controllers.length; i++){
            const boid = boids[i]
            const gridKey = `${Math.floor(boid.transform.position.x / cellSize)},${Math.floor(boid.transform.position.y / cellSize)},${Math.floor(boid.transform.position.z / cellSize)}`
            if (!grid.has(gridKey))
                 grid.set(gridKey, [])

            grid.get(gridKey).push(boid);
        }

        for (let i = 0; i < this.controllers.length; i++){
            const boid = boids[i]
            const forward = Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1}));

            const neighbours: {boid: Boid, offset: Vec3, distance: number}[] = []
            for (let dz = -1; dz <= 1; dz++) {
                for (let dx = -1; dx <= 1; dx++) {

                    const key = `${Math.floor(boid.transform.position.x / cellSize) + dx},${Math.floor(boid.transform.position.y / cellSize)},${Math.floor(boid.transform.position.z / cellSize) + dz}`;

                    const cellBoids = grid.get(key);

                    if (!cellBoids) continue;

                    for (const other of cellBoids) {
                        const offset = Vec3.subtract(other.transform.position, boid.transform.position);
                        const distance = Vec3.magnitude(offset)
                        if ( distance < visualRange && distance != 0)
                            neighbours.push({
                                boid: other,
                                offset,
                                distance: distance,
                            });
                    }
                }
            }
            
            // Coherence 
            let center = boid.transform.position;
            let coherenceAngle = 0;
            let separationAngle = 0
            let alignmentAngle = 0;
            let boundsAngle = 0;
            neighbours.forEach(neighbour => {
                center = Vec3.add(center, neighbour.boid.transform.position)

                // Separation
                const separationToTarget = Vec3.normalise(neighbour.offset)
                
                const separationDot = Vec3.dot(forward, separationToTarget);

                const separationCross = Vec3.cross(forward, separationToTarget);

                separationAngle -= (1/neighbour.distance) * Math.atan2(separationCross.y, separationDot);
            
                // Alignment
                const otherForward = Vec3.normalise(Matrix3.apply(neighbour.boid.transform.orientation, {x: 0, y: 0, z: 1}));

                const alignmentDot = Vec3.dot(forward, otherForward);

                const alignmentCross = Vec3.cross(forward, otherForward);

                alignmentAngle += (1/neighbour.distance) * Math.atan2(alignmentCross.y, alignmentDot);
            })

            if (neighbours.length > 0){
                center = Vec3.scale(center, 1/(neighbours.length + 1))
    
                const coherenceToTarget = Vec3.normalise(Vec3.subtract(center, boid.transform.position))
                const coherenceDot = Vec3.dot(forward, coherenceToTarget);
    
                const coherenceCross = Vec3.cross(forward, coherenceToTarget);
    
                coherenceAngle += Math.atan2(coherenceCross.y, coherenceDot);
                alignmentAngle /= neighbours.length;
                separationAngle /= neighbours.length;
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

const coherenceWeight = 0.2;
const separationWeight = 0.5;
const alignmentWeight = 2;
const boundsWeight = 10;

const visualRange = 2;

