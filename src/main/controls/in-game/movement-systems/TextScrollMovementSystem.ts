import { Matrix3, Vec3 } from "../../../maths/index";
import { Intent } from "../../../maths/Intent";
import { Scene } from "../../../scene/Scene";
import MovementSystem from "./MovementSystem";
import { GameObject } from "../../../scene/game-objects/index";

const scrollSpeed = 1;

export default class TextScrollMovementSystem implements MovementSystem {
    move(target: GameObject, cameraIntent: Intent, scene: Scene, dt: number){
        this.translate(target, cameraIntent, dt)
    }

    translate(target: GameObject, intent: Intent, dt: number){
        if (intent.yDirection == 1){
            target.transform.position.y += dt * scrollSpeed
        }
    }
}