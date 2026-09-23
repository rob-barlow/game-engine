import { PlayerController } from "../../controls/in-game/controllers/PlayerController.js";
import { Matrix3, Transform, Vec3 } from "../../maths/index.js";
import Player from "../../scene/game-objects/Player.js";
import { Scene } from "../../scene/Scene.js";

export function addPlayer(scene: Scene, position: Vec3 = {x: 0, y: 2.5, z: 0}, startOrientation: Matrix3 = Matrix3.identity()){
    const playerTransform: Transform = {
        position: position,
        orientation: startOrientation,
        scale: {x: 1, y: 1, z: 1}
    }
    
    const player = new Player(playerTransform)

    const playerController = new PlayerController(player)

    playerController.control(player)
    
    scene.add(player);
    scene.setActiveCamera(player);

    return playerController
}