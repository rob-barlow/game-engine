import { DroneController } from "../../controls/in-game/controllers/DroneController";
import { PlayerController } from "../../controls/in-game/controllers/PlayerController";
import { Matrix3, Transform, Vec3 } from "../../maths/index";
import Drone from "../game-objects/Drone";
import Player from "../game-objects/Player";
import { Scene } from "../Scene";

export function addPlayer(scene: Scene, position: Vec3 = {x: 0, y: 2.5, z: 0}, startOrientation: Matrix3 = Matrix3.identity()){
    const playerTransform: Transform = {
        position: position,
        orientation: startOrientation,
        scale: {x: 1, y: 1, z: 1}
    }
    
    const player = new Player(playerTransform)

    const playerController = new PlayerController(player)

    scene.add(player);
    scene.setActiveCamera(player);

    return playerController
}

export function addDrone(scene: Scene, position: Vec3 = {x: 0, y: 2.5, z: 0}, startOrientation: Matrix3 = Matrix3.identity()){
    const droneTransform: Transform = {
        position: position,
        orientation: startOrientation,
        scale: {x: 1, y: 1, z: 1}
    }
    
    const drone = new Drone(droneTransform)

    const droneController = new DroneController(drone)

    scene.add(drone);
    scene.setActiveCamera(drone);

    return droneController
}