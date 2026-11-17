import { Controller } from "../../../controls/in-game/controllers/Controller";
import { BoidsMasterController } from "./controllers/BoidsMasterController";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import { Scene } from "../../Scene";
import { Boid } from "./game-objects/Boid";
import { DroneController } from "../../../controls/in-game/controllers/DroneController";
import Drone from "../../game-objects/Drone";
import { IndividualBoidController } from "./controllers/IndividualBoidController";
import { BoidXBound, BoidZBound } from "../../../utils/constants";
import { Updatable } from "../../../app/Updatable";

const boidCubeRoot = 50;
const posScale = 0.5;

export function createBoidsScene(): {scene: Scene, controllers: Controller[], updatables: Updatable[]} {
    const scene = new Scene();

    const playerTransform: Transform = {
        position: {x: BoidXBound/2, y: BoidXBound/3, z: BoidZBound/2},
        orientation: Matrix3.getRotationMatrix('x', Math.PI/2),
        scale: {x: 1, y: 1, z: 1}
    }
        
    const drone = new Drone(playerTransform)
    
    scene.add(drone);
    scene.setActiveCamera(drone);
    const cameraController = new DroneController(drone)

    const controllers: IndividualBoidController[] = [];
    
    const masterController = new BoidsMasterController();

    for (let x = 0; x < boidCubeRoot; x++){
        for (let z = 0; z < boidCubeRoot; z++){
                const cubeTransform: Transform = {
                    position: {x: posScale * x * Math.random(), y: 0, z: posScale * z * Math.random()},
                        orientation: Matrix3.getRotationMatrix('y', Math.random() * 2 * Math.PI),
                        scale: {x: 0.1, y: 0.1, z: 0.1},
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