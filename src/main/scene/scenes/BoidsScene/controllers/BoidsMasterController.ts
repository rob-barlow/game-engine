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
        let center = {x: 0, y: 0, z: 0};

        this.controllers.forEach(controller => {
            center = Vec3.add(center, controller.targets[0].transform.position)
        })
        
        this.center = Vec3.scale(center, 1 / this.controllers.length);
        // this.centralPanel.transform.position = this.center;

        // const futurePositions = this.controllers.map(controller => {
        //     return Vec3.add(controller.targets[0].transform.position, Vec3.scale(Matrix3.apply(controller.targets[0].transform.orientation, {x: 0, y: 0, z: 1}), 1/60))
        // })


        for (let i = 0; i < this.controllers.length; i++){
            const currentBoid = this.controllers[i].targets[0]
            // const futurePosition = futurePositions[i]

            // Coherence
            const toTarget = Vec3.normalise(Vec3.subtract(this.center, currentBoid.transform.position))
            const forward = Vec3.normalise(Matrix3.apply(currentBoid.transform.orientation, {x: 0, y: 0, z: 1}));
            
            const dot = Vec3.dot(forward, toTarget);

            const cross = Vec3.cross(forward, toTarget);

            const coherenceAngle = Math.atan2(cross.y, dot);

            // (this.controllers[i].targets[0] as Boid).angle = angle;
            // this.intents[i].yaw += angle * -0.01
        
            // Separation
            let separationAngle = 0
            let alignmentAngle = 0
            for (let j = 0; j < this.controllers.length; j++){
                if (i == j) continue;

                const otherBoid = this.controllers[j].targets[0]

                const separationVec = Vec3.subtract(otherBoid.transform.position, currentBoid.transform.position)

                const distance = Vec3.magnitude(separationVec)

                if (distance < 0.5){
                    const toTarget = Vec3.normalise(separationVec)
                    
                    const dot = Vec3.dot(forward, toTarget);

                    const cross = Vec3.cross(forward, toTarget);

                    separationAngle += 1/distance * Math.atan2(cross.y, dot);
                }

                // Alignment
                if (distance < 0.5) {
                    const otherForward = Vec3.normalise(Matrix3.apply(otherBoid.transform.orientation, {x: 0, y: 0, z: 1}));

                    const dot = Vec3.dot(forward, otherForward);

                    const cross = Vec3.cross(forward, otherForward);

                    alignmentAngle += 1/distance * Math.atan2(cross.y, dot);
                }
            }

            const a = coherenceAngle * coherenceWeight
            const b = -separationAngle * separationWeight
            const c = alignmentAngle * alignmentWeight
            // console.log("coherence: " + a + ", separation: " + b)
            const correctYaw = a + b + c
            this.intents[i].yaw += (correctYaw - this.intents[i].yaw) * 0.1
        }

    }
}

const coherenceWeight = 0.05;
const separationWeight = 0.1;
const alignmentWeight = 0.4;