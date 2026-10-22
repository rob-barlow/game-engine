import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform } from "../../../maths/index";
import { Panel } from "../../game-objects/Panel";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

export function createTestScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    let panelTransform1: Transform = {
        position: {x: 0, y: 2, z: 2},
        orientation: Matrix3.getRotationMatrix("x", -2 * Math.PI * (90/360)),
        scale: {x: 1, y: 1, z: 1},
    }
    scene.add(new Panel(panelTransform1))

    let panelTransform2: Transform = {
        position: {x: 0, y: 2, z: 4},
        orientation:  Matrix3.getRotationMatrix("x", -2 * Math.PI * (90/360)),
        scale: {x: 1, y: 1, z: 1},
    }
    scene.add(new Panel(panelTransform2, [255, 0, 0]))

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}
