import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform } from "../../../maths/index";
import Rabbit from "../../game-objects/Rabbit";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

export function createRabbitScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    let rabbitTransform: Transform = {
        position: {x: 0, y: 1, z: 10},
        orientation: Matrix3.identity(),
        scale: {x: 0.05, y: 0.05, z: 0.05},
    }
    scene.add(new Rabbit(rabbitTransform))

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}
