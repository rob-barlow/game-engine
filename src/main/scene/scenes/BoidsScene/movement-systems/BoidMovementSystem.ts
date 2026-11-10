import { Matrix3, Vec3 } from "../../../../maths/index";
import { Intent } from "../../../../maths/Intent";
import MovementSystem from "../../../../controls/in-game/movement-systems/MovementSystem";
import { GameObject } from "../../../game-objects/GameObject";
import { Scene } from "../../../Scene";
import { BoidRotationSpeed, BoidSpeed } from "../../../../utils/constants";

export default class BoidMovementSystem implements MovementSystem {
    move(target: GameObject, cameraIntent: Intent, scene: Scene, dt: number){
        this.translate(target, cameraIntent, dt)
        this.rotate(target, cameraIntent, dt)
    }

    translate(target: GameObject, intent: Intent, dt: number){
        const oldPosition = target.transform.position

        let translation = {x: intent.xDirection, y: intent.yDirection, z: intent.zDirection}

        translation = Matrix3.apply(target.transform.orientation, translation);
        translation.y = 0; // Prevent vertical movement

        const distanceMoved = dt * BoidSpeed
        translation = Vec3.scale(Vec3.normalise(translation), distanceMoved); 
        const newPosition = Vec3.add(oldPosition, translation);

        target.transform.position = newPosition
    }

    rotate(target: GameObject, intent: Intent, dt: number){
        let angle: number = dt * BoidRotationSpeed * intent.yaw;
        target.transform.orientation = Matrix3.multiply(Matrix3.getRotationMatrix('y', angle), target.transform.orientation)
    }
}