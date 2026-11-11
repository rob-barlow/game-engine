import { Matrix3, Vec3 } from "../../../../maths";
import { Intent } from "../../../../maths/Intent";
import { Panel } from "../../../game-objects/Panel";
import { Boid } from "../game-objects/Boid";
import { IndividualBoidController } from "./IndividualBoidController";

const coherence = 1;

export class BoidsMasterController {
    controllers: IndividualBoidController[] = []
    intents: Intent[] = []
    center: Vec3 = {x: 0, y: 0, z: 0}
    // centralPanel: Panel | null = null;

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

    // setCentralPanel(centralPanel: Panel){
    //     this.centralPanel = centralPanel;
    // }

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
            // let center = {x: 0, y: 0, z: 0};

        const boids = this.controllers.map(controller => controller.targets[0])

        for (let i = 0; i < this.controllers.length; i++){
            const boid = boids[i]
            const forward = Vec3.normalise(Matrix3.apply(boid.transform.orientation, {x: 0, y: 0, z: 1}));

            const neighbours = boids
            .map(other => {
                const offset = Vec3.subtract(
                    other.transform.position,
                    boid.transform.position
                );

                // const direction = Matrix3.apply(other.transform.orientation, {x: 0, y: 0, z: 1})

                return {
                    boid: other,
                    offset,
                    distance: Vec3.magnitude(offset),
                };
            })
            .filter(a => a.distance < visualRange && a.distance != 0);

            // Coherence 
            let center = boid.transform.position;
            let coherenceAngle = 0;
            let separationAngle = 0
            let alignmentAngle = 0;
            let boundsAngle = 0;
            neighbours.forEach(neighbour => {
                center = Vec3.add(center, neighbour.boid.transform.position)

                if (neighbour.distance < visualRange){
                    // Coherence

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
                }
            })

            // console.log(neighbours.length)

            if (neighbours.length > 0){
                center = Vec3.scale(center, 1/neighbours.length + 1)
    
                const coherenceToTarget = Vec3.normalise(Vec3.subtract(this.center, boid.transform.position))
                const coherenceDot = Vec3.dot(forward, coherenceToTarget);
    
                const coherenceCross = Vec3.cross(forward, coherenceToTarget);
    
                coherenceAngle += Math.atan2(coherenceCross.y, coherenceDot);
            }

            // keep in bound
            if (boid.transform.position.x > xBound || boid.transform.position.x < 0) {
                const toTarget = boid.transform.position.x > xBound ? {x: -1, y: 0, z: 0} : {x: 1, y: 0, z: 0}
                
                const dot = Vec3.dot(forward, toTarget);

                const cross = Vec3.cross(forward, toTarget);

                boundsAngle = Math.atan2(cross.y, dot);
            }
            if (boid.transform.position.z > zBound || boid.transform.position.z < 0) {
                const toTarget = boid.transform.position.z > zBound ? {x: 0, y: 0, z: -1} : {x: 0, y: 0, z: 1}
                
                const dot = Vec3.dot(forward, toTarget);

                const cross = Vec3.cross(forward, toTarget);

                boundsAngle = Math.atan2(cross.y, dot);
            }

            const a = coherenceAngle * coherenceWeight
            const b = separationAngle * separationWeight
            const c = alignmentAngle * alignmentWeight
            const d = boundsAngle * boundsWeight

            // console.log("coherence: " + a + ", separation: " + b + ", alignment: " + c+ ", bounds: " + d)
            const correctYaw = Math.max(Math.min(a + b + c + d, Math.PI/2), -Math.PI/2);

            // console.log(correctYaw)
            this.intents[i].yaw = correctYaw
            // this.intents[i].yaw += (correctYaw - this.intents[i].yaw) * 0.1
        }

        // const futurePositions = this.controllers.map(controller => {
        //     return Vec3.add(controller.targets[0].transform.position, Vec3.scale(Matrix3.apply(controller.targets[0].transform.orientation, {x: 0, y: 0, z: 1}), 1/60))
        // })
    }
}

const coherenceWeight = 1;
const separationWeight = 0.2;
const alignmentWeight = 1
const boundsWeight = 1;

const visualRange = 0.3;

const xBound = 10;
const zBound = 10

