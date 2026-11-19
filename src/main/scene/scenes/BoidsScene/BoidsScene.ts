import { Controller } from "../../../controls/in-game/controllers/Controller";
import { BoidsMasterController } from "./controllers/BoidsMasterController";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import { Scene } from "../../Scene";
import { Boid } from "./game-objects/Boid";
import { DroneController } from "../../../controls/in-game/controllers/DroneController";
import Drone from "../../game-objects/Drone";
import { IndividualBoidController } from "./controllers/IndividualBoidController";
import { xBoidLowerBound, xBoidUpperBound, zBoidLowerBound, zBoidUpperBound } from "../../../utils/constants";
import { Updatable } from "../../../app/Updatable";

const boidSquareRoot = 70;

export function createBoidsScene(): {scene: Scene, controllers: Controller[], updatables: Updatable[]} {
    const scene = new Scene();

    const playerTransform: Transform = {
        position: {x: (xBoidUpperBound + xBoidLowerBound)/2, y: xBoidUpperBound/3, z: (zBoidUpperBound + zBoidLowerBound)/2},
        orientation: Matrix3.getRotationMatrix('x', Math.PI/2),
        scale: {x: 1, y: 1, z: 1}
    }
        
    const drone = new Drone(playerTransform)
    
    scene.add(drone);
    scene.setActiveCamera(drone);
    const cameraController = new DroneController(drone)

    const controllers: IndividualBoidController[] = [];
    
    const masterController = new BoidsMasterController();

    for (let x = 0; x < boidSquareRoot; x++){
        for (let z = 0; z < boidSquareRoot; z++){
                const cubeTransform: Transform = {
                    position: {x: ((xBoidUpperBound - xBoidLowerBound) * Math.random()) + xBoidLowerBound, y: 0, z: ((zBoidUpperBound - zBoidLowerBound) * Math.random()) + zBoidLowerBound},
                    orientation: Matrix3.getRotationMatrix('y', Math.random() * 2 * Math.PI),
                    scale: {x: 0.3, y: 0.3, z: 0.3},
                }
                    
                const boid = new Boid(cubeTransform, [255, 255, 255]);
                const controller = new IndividualBoidController(boid, masterController);
                controllers.push(controller);
                scene.add(boid);
        }
    }

    masterController.setControllers(controllers);

    return {scene: scene, controllers: [...controllers, cameraController], updatables: [masterController]};
}