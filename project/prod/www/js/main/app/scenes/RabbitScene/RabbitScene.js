import { Matrix3 } from "../../../maths/index.js";
import Rabbit from "../../../scene/game-objects/Rabbit.js";
import { Scene } from "../../../scene/Scene.js";
import { addPlayer } from "../Extensions.js";
export function createRabbitScene() {
    const scene = new Scene();
    let rabbitTransform = {
        position: { x: 0, y: 1, z: 10 },
        orientation: Matrix3.identity(),
        scale: { x: 0.05, y: 0.05, z: 0.05 },
    };
    scene.add(new Rabbit(rabbitTransform));
    const playerController = addPlayer(scene);
    return { scene: scene, controllers: [playerController] };
}
