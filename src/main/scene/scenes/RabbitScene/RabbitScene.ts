import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform } from "../../../maths/index";
import Rabbit from "../../game-objects/Rabbit";
import { Scene } from "../../Scene";
import { addDrone, addPlayer } from "../Extensions";

export function createRabbitScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();
    const rootRabbitCount = 4

    for (let x = -rootRabbitCount/2; x < rootRabbitCount/2; x++){
        for (let z = -rootRabbitCount/2; z < rootRabbitCount/2; z++){
            let rabbitTransform: Transform = {
                position: {x: x * 10, y: 1, z: z * 10},
                orientation: Matrix3.identity(),
                scale: {x: 0.05, y: 0.05, z: 0.05},
            }
            scene.add(new Rabbit(rabbitTransform))
        }
    }

    const droneController = addDrone(scene);

    return {scene: scene, controllers: [droneController]};
}
