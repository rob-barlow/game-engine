import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform } from "../../../maths/index";
import { Panel } from "../../game-objects/Panel";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

export function createRabbitScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    let panelTransform1: Transform = {
        position: {x: 0, y: 1, z: 10},
        orientation: Matrix3.identity(),
        scale: {x: 1, y: 1, z: 1},
    }
    scene.add(new Panel(panelTransform1))

    let panelTransform2: Transform = {
        position: {x: 0, y: 1, z: 20},
        orientation: Matrix3.identity(),
        scale: {x: 1, y: 1, z: 1},
    }
    scene.add(new Panel(panelTransform2, [50, 5, 200]))

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}
