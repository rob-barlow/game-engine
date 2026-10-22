import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform } from "../../../maths/index";
import { Panel } from "../../game-objects/Panel";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

export function createTestScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    const anglesDeg = [0, 90, 180, 270];
    const angles = anglesDeg.map(degrees => -2 * Math.PI * (degrees/360))

    const positions = [
        {x: 0, y: 2, z: 2},
        {x: -2, y: 2, z: 0},
        {x: 0, y: 2, z: -2},
        {x: 2, y: 2, z: 0},
    ]
    for (let i = 0; i < 4; i++){
        const currentAngle = angles[i];
        const currentPosition = positions[i];

        const orientation = Matrix3.multiply(Matrix3.getRotationMatrix("y", currentAngle), Matrix3.getRotationMatrix("x", -2 * Math.PI * (90/360)))
        let panelTransform1: Transform = {
            position: currentPosition,
            orientation: orientation,
            scale: {x: 1, y: 1, z: 1},
        }
        scene.add(new Panel(panelTransform1))

        let panelTransform2: Transform = {
            position: {x: currentPosition.x * 2, y: currentPosition.y, z: currentPosition.z * 2},
            orientation:  orientation,
            scale: {x: 1, y: 1, z: 1},
        }
        scene.add(new Panel(panelTransform2, [255, 0, 0]))
    }

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}
