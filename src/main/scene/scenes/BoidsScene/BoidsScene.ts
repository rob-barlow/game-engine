import { Controller } from "../../../controls/in-game/controllers/Controller";
import { BoidsMasterController } from "./controllers/BoidsMasterController";
import { Matrix3, Transform, Vec3 } from "../../../maths/index";
import { Scene } from "../../Scene";
import { Boid } from "./game-objects/Boid";
import { DroneController } from "../../../controls/in-game/controllers/DroneController";
import Drone from "../../game-objects/Drone";
import { IndividualBoidController } from "./controllers/IndividualBoidController";
import { BoidXBound, BoidZBound } from "../../../utils/constants";

const boidCubeRoot = 30;
const posScale = 0.5;

export function createBoidsScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    const playerTransform: Transform = {
        position: {x: BoidXBound/2, y: 15, z: BoidZBound/2},
        // position: {x: (boidCubeRoot - 1) * posScale * 0.5, y: 4, z: (boidCubeRoot - 1) * posScale * 0.5},
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
                    position: {x: posScale * x * Math.random(), y: 2, z: posScale * z * Math.random()},
                        orientation: Matrix3.identity(),
                        scale: {x: 0.1, y: 0.1, z: 0.1},
                    }
                    
                const boid = new Boid(cubeTransform, [255, 255, 255]);
                const controller = new IndividualBoidController(boid, masterController);
                controllers.push(controller);
                scene.add(boid);
        }
    }

    masterController.setControllers(controllers);

    // const panelTransform: Transform = {
    //     position: {x: 0, y: 0, z: 0},
    //     orientation: Matrix3.identity(),
    //     scale: {x: 0.1, y: 0.1, z: 0.1},
    // }
    // const centralPanel = new Panel(panelTransform, [0,255,0])
    // scene.add(centralPanel);
    // masterController.setCentralPanel(centralPanel)

    return {scene: scene, controllers: [...controllers, cameraController]};
}