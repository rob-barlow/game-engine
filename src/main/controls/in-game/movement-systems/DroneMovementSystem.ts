import { Matrix3, Vec3 } from "../../../maths/index";
import { Intent } from "../../../maths/Intent";
import { Line3 } from "../../../maths/Line3";
import { Scene } from "../../../scene/Scene";
import { CameraRotationSpeed, CameraSpeed } from "../../../utils/constants";
import MovementSystem from "./MovementSystem";
import { GameObject } from "../../../scene/game-objects/index";

export default class DroneMovementSystem implements MovementSystem {
    move(target: GameObject, cameraIntent: Intent, scene: Scene, dt: number){
        this.translate(target, cameraIntent, dt)
        this.rotate(target, cameraIntent, dt)
    }

    translate(target: GameObject, intent: Intent, dt: number){
        if (intent.xDirection == 0 && intent.yDirection == 0 && intent.zDirection == 0) {
            return;
        }

        const oldPosition = target.transform.position

        let translation = {x: intent.xDirection, y: 0, z: intent.zDirection}

        translation = Matrix3.apply(target.transform.orientation, translation);
        translation.y = intent.yDirection;

        const distanceMoved = dt * CameraSpeed
        translation = Vec3.scale(Vec3.normalise(translation), distanceMoved); 
        const newPosition = Vec3.add(oldPosition, translation);

        target.transform.position = newPosition
    }

    rotate(target: GameObject, intent: Intent, dt: number){
        if (intent.yaw != 0){
            let angle: number = dt * CameraRotationSpeed * intent.yaw;
            target.transform.orientation = Matrix3.multiply(Matrix3.getRotationMatrix('y', angle), target.transform.orientation)
        }

        if (intent.pitch != 0){
            let angle: number = dt * CameraRotationSpeed * intent.pitch;

            let xLocalVector: Vec3 = Matrix3.getColumn(target.transform.orientation, 0);
            xLocalVector = Vec3.normalise(xLocalVector);

            const xLocalAxis: Line3 = {
                direction: xLocalVector,
                pointOnLine: Vec3.empty()
            } 

            const yLocalVector: Vec3 = Matrix3.getColumn(target.transform.orientation, 1);
            const zLocalVector: Vec3 = Matrix3.getColumn(target.transform.orientation, 2);

            let yNewVector = Vec3.rotate(xLocalAxis, yLocalVector, angle)
            yNewVector = Vec3.normalise(yNewVector);

            let zNewVector = Vec3.rotate(xLocalAxis, zLocalVector, angle)
            zNewVector = Vec3.normalise(zNewVector);

            if (yNewVector.y < 0) {
                yNewVector.y = 0;
                // zNewVector = {x: 0, y: -1, z: 0}
                zNewVector = zLocalVector
            }

            target.transform.orientation = [
                [xLocalVector.x, yNewVector.x, zNewVector.x],
                [xLocalVector.y, yNewVector.y, zNewVector.y],
                [xLocalVector.z, yNewVector.z, zNewVector.z]
            ]
        }
    }
}