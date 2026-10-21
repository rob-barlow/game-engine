import MovementSystem from "../../../../controls/in-game/movement-systems/MovementSystem";
import { Intent } from "../../../../maths/Intent";
import { GameObject } from "../../../game-objects/GameObject";
import { Scene } from "../../../Scene";

const CameraSpeed = 4;

export default class CvCameraMovementSystem implements MovementSystem {
    move(target: GameObject, cameraIntent: Intent, scene: Scene, dt: number){
        target.transform.position.y += dt * CameraSpeed * cameraIntent.yDirection
    }
}