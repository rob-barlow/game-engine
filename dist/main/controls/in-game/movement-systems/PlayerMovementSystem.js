import { Matrix3, Vec3 } from "../../../maths/index.js";
import { CameraRotationSpeed, CameraSpeed } from "../../../utils/constants.js";
import BoxCollider from "../../../collisions/BoxCollider.js";
export default class PlayerMovementSystem {
    move(target, cameraIntent, scene, dt) {
        this.translate(target, cameraIntent, scene, dt);
        this.rotate(target, cameraIntent, dt);
    }
    translate(target, intent, scene, dt) {
        if (intent.xDirection == 0 && intent.zDirection == 0)
            return;
        const oldPosition = target.transform.position;
        let translation = { x: intent.xDirection, y: 0, z: intent.zDirection };
        translation = Matrix3.apply(target.transform.orientation, translation);
        translation.y = 0;
        const distanceMoved = dt * CameraSpeed;
        translation = Vec3.scale(Vec3.normalise(translation), distanceMoved);
        for (let attempts = 0; attempts < 2; attempts++) {
            let result = this.tryTranslate(target, scene, oldPosition, translation);
            if (result)
                translation = result;
        }
    }
    tryTranslate(target, scene, oldPosition, translation) {
        const newPosition = Vec3.add(oldPosition, translation);
        const collider = scene.getBoundingBoxContaining(newPosition);
        if (collider == null) {
            target.transform.position = newPosition;
            return;
        }
        else {
            //implement sliding here
            if (collider instanceof BoxCollider) {
                const boxCollider = collider;
                const min = boxCollider.min;
                const max = boxCollider.max;
                // old position + translation.
                // line is old position + t * translation
                // find when x == min x and x == max x
                // for min x, t = (minx - oldPosition.x)/translation.x
                // take it for 0 < t < 1 -- there will only be 1
                // if the point has y in the boundary, it hit the min/max x and then needs to slide
                // in slide, take position as oldPosition + (translation * t)
                // then move (0, 0, (1-t) * translation.z)
                // else this means it hit the x first and y second so repeat for min y and max y
                if (oldPosition.x == min.x || oldPosition.x == max.x) {
                    target.transform.position.z += translation.z;
                    return { x: 0, y: 0, z: 0 };
                }
                if (oldPosition.z == min.z || oldPosition.z == max.z) {
                    target.transform.position.x += translation.x;
                    return { x: 0, y: 0, z: 0 };
                }
                let t;
                let pointOnEdge;
                let hitsZboundaryLast = true;
                if (oldPosition.x < min.x || oldPosition.x > max.x) {
                    const crossedXaxis = translation.x > 0 ? min.x : max.x;
                    t = (crossedXaxis - oldPosition.x) / translation.x;
                    if (t < 0 || t > 1) {
                        console.log("SHIT!");
                        return { x: 0, y: 0, z: 0 };
                    }
                    pointOnEdge = Vec3.add(oldPosition, Vec3.scale(translation, t));
                    hitsZboundaryLast = (pointOnEdge.z < min.z || pointOnEdge.z > max.z);
                }
                if (hitsZboundaryLast) {
                    const crossedZaxis = translation.z > 0 ? min.z : max.z;
                    t = (crossedZaxis - oldPosition.z) / translation.z;
                    if (t < 0 || t > 1) {
                        console.log("SHIT2!");
                        return { x: 0, y: 0, z: 0 };
                    }
                    pointOnEdge = Vec3.add(oldPosition, Vec3.scale(translation, t));
                }
                if (t == undefined || pointOnEdge == undefined) {
                    return { x: 0, y: 0, z: 0 };
                }
                const slidingTranslation = hitsZboundaryLast ? { x: (1 - t) * translation.x, y: 0, z: 0 } : { x: 0, y: 0, z: (1 - t) * translation.z };
                return slidingTranslation;
                // if (oldPosition.x < boxCollider.min.x){
                //     const oldToMin = Vec3.subtract(boxCollider.min, oldPosition)
                //     const translationGradient = translation.z / translation.x
                //     const oldToMinGradient = oldToMin.z / oldToMin.x
                //     if (translationGradient > oldToMinGradient) // intersects with minx
                //     {
                //         const dx = boxCollider.min.x - oldPosition.x
                //         const pointOnEdge = {x: boxCollider.min.x, y: oldPosition.y, z: (dx * translationGradient) + oldPosition.z}
                //     }
                // }
            }
        }
    }
    rotate(target, intent, dt) {
        if (intent.yaw != 0) {
            let angle = dt * CameraRotationSpeed * intent.yaw;
            target.transform.orientation = Matrix3.multiply(Matrix3.getRotationMatrix('y', angle), target.transform.orientation);
        }
        if (intent.pitch != 0) {
            let angle = dt * CameraRotationSpeed * intent.pitch;
            let xLocalVector = Matrix3.getColumn(target.transform.orientation, 0);
            xLocalVector = Vec3.normalise(xLocalVector);
            const xLocalAxis = {
                direction: xLocalVector,
                pointOnLine: Vec3.empty()
            };
            const yLocalVector = Matrix3.getColumn(target.transform.orientation, 1);
            const zLocalVector = Matrix3.getColumn(target.transform.orientation, 2);
            let yNewVector = Vec3.rotate(xLocalAxis, yLocalVector, angle);
            yNewVector = Vec3.normalise(yNewVector);
            let zNewVector = Vec3.rotate(xLocalAxis, zLocalVector, angle);
            zNewVector = Vec3.normalise(zNewVector);
            if (yNewVector.y < 0) {
                yNewVector.y = 0;
                // zNewVector = {x: 0, y: -1, z: 0}
                zNewVector = zLocalVector;
            }
            target.transform.orientation = [
                [xLocalVector.x, yNewVector.x, zNewVector.x],
                [xLocalVector.y, yNewVector.y, zNewVector.y],
                [xLocalVector.z, yNewVector.z, zNewVector.z]
            ];
        }
    }
}
