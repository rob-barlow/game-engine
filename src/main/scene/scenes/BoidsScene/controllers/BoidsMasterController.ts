import { Matrix3, Vec3 } from "../../../../maths";
import { Intent } from "../../../../maths/Intent";
import { Panel } from "../../../game-objects/Panel";
import { IndividualBoidController } from "./IndividualBoidController";

const coherence = 1;

export class BoidsMasterController {
    controllers: IndividualBoidController[] = []
    intents: Intent[] = []
    center: Vec3 = {x: 0, y: 0, z: 0}
    centralPanel: Panel | null = null;

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

    setCentralPanel(centralPanel: Panel){
        this.centralPanel = centralPanel;
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
        // calculate central position
        let center = {x: 0, y: 0, z: 0};

        this.controllers.forEach(controller => {
            center = Vec3.add(center, controller.targets[0].transform.position)
        })
        
        this.center = Vec3.scale(center, 1 / this.controllers.length);
        this.centralPanel.transform.position = this.center;

        for (let i = 0; i < this.controllers.length; i++){
            // move toward center
            let offset = Vec3.normalise(Vec3.subtract(this.controllers[i].targets[0].transform.position, this.center))
            let worldDirection = Vec3.normalise(Matrix3.apply(this.controllers[i].targets[0].transform.orientation, {x: 0, y: 0, z: 1}));

            const angle = Math.acos(Vec3.dot(offset, worldDirection)) - (Math.PI / 2)

            this.intents[i].yaw += angle * -0.01
        }
    }
}
