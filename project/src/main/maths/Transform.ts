import { farPlaneZ, nearPlaneZ } from "../utils/constants.js";
import { CanvasSize } from "../utils/types.js";
import { Matrix3, Matrix4, Vec3 } from "./index.js";

export type Transform = {
    position: Vec3,
    orientation: Matrix3,
    scale: Vec3
}

export const Transform = {
    getWorldMatrix(transform: Transform): Matrix4 {
        const scaleMatrix: Matrix3 = [
            [transform.scale.x, 0, 0],
            [0, transform.scale.y, 0],
            [0, 0, transform.scale.z]
        ];

        const scaledRotationMatrix3 = Matrix3.multiply(scaleMatrix, transform.orientation);

        return (
            [[scaledRotationMatrix3[0][0], scaledRotationMatrix3[0][1], scaledRotationMatrix3[0][2], transform.position.x],
            [scaledRotationMatrix3[1][0], scaledRotationMatrix3[1][1], scaledRotationMatrix3[1][2], transform.position.y],
            [scaledRotationMatrix3[2][0], scaledRotationMatrix3[2][1], scaledRotationMatrix3[2][2], transform.position.z],
            [0,0,0,1]]
        );
    },

    getInverseWorldMatrix(transform: Transform): Matrix4 {
        const inverseTransform = this.getInverse(transform);

        const cameraViewTransform: Transform = {
            orientation: inverseTransform.orientation,
            position: Matrix3.apply(inverseTransform.orientation, inverseTransform.position),
            scale: inverseTransform.scale
        }

        return this.getWorldMatrix(cameraViewTransform);
    },

    getInverse(transform: Transform): Transform {
        return {
            position: Vec3.scale(transform.position, -1),
            orientation: Matrix3.transpose(transform.orientation),
            scale: {x: 1/transform.scale.x, y: 1/transform.scale.y, z: 1/transform.scale.z}
        }
    },

    getProjectionMatrix(canvasSize: CanvasSize): Matrix4 {
        const aspectRatio = canvasSize.width / canvasSize.height;
        
        const projectionMatrix: Matrix4 = Matrix4.empty();

        projectionMatrix[0][0] = 1/aspectRatio;
        projectionMatrix[1][1] = 1;
        projectionMatrix[2][2] = (nearPlaneZ + farPlaneZ)/(farPlaneZ - nearPlaneZ);
        projectionMatrix[2][3] = (-2 * nearPlaneZ * farPlaneZ)/(farPlaneZ - nearPlaneZ);
        projectionMatrix[3][2] = 1;

        return projectionMatrix;
    },

    getViewportMatrix(canvasSize: CanvasSize): Matrix4 {
        const viewportMatrix: Matrix4 = Matrix4.identity();

        viewportMatrix[0][0] = (canvasSize.width/2) - 1
        viewportMatrix[0][3] = (canvasSize.width + 1)/2
        viewportMatrix[1][1] = -(canvasSize.height/2) + 1
        viewportMatrix[1][3] = (canvasSize.height - 1)/2

        return viewportMatrix;
    }
}