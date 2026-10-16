import { PlayerController } from "../../controls/in-game/controllers/PlayerController.js";
import { Matrix3 } from "../../maths/index.js";
import Player from "../../scene/game-objects/Player.js";
export function addPlayer(scene, position = { x: 0, y: 2.5, z: 0 }, startOrientation = Matrix3.identity()) {
    const playerTransform = {
        position: position,
        orientation: startOrientation,
        scale: { x: 1, y: 1, z: 1 }
    };
    const player = new Player(playerTransform);
    const playerController = new PlayerController(player);
    playerController.control(player);
    scene.add(player);
    scene.setActiveCamera(player);
    return playerController;
}
