import { Matrix3, Transform, Vec3 } from "../../../maths/index.js"

const MazePanelTypes = {
    getPanelTransform(position: Vec3, normal: Vec3): Transform {
        const xNormal = {x: 1, y: 0, z: 0}
        const xNegNormal = {x: -1, y: 0, z: 0}
        const yNegNormal = {x: 0, y: -1, z: 0}
        const zNormal = {x: 0, y: 0, z: 1}
        const zNegNormal = {x: 0, y: 0, z: -1}

        let orientation: Matrix3 = Matrix3.identity()
        let positionOffset: Vec3 = {x: 0, y: 0, z: 0}
        const minusZOrientation: Matrix3 = Matrix3.getRotationMatrix('x', -Math.PI/2)

        if (Vec3.equals(normal, xNormal)){
            orientation = Matrix3.multiply(Matrix3.getRotationMatrix('y', -Math.PI/2), minusZOrientation)
        }
        else if (Vec3.equals(normal, xNegNormal)){
            orientation = Matrix3.multiply(Matrix3.getRotationMatrix('y', Math.PI/2), minusZOrientation)
            positionOffset.z = 1
        }
        else if (Vec3.equals(normal, yNegNormal)){
            orientation = Matrix3.multiply(Matrix3.getRotationMatrix('z', Math.PI), Matrix3.identity())
            positionOffset.x = 1
        }
        else if (Vec3.equals(normal, zNormal)){
            orientation = Matrix3.multiply(Matrix3.getRotationMatrix('y', Math.PI), minusZOrientation)
            positionOffset.x = 1
        }
        else if (Vec3.equals(normal, zNegNormal)){
            orientation = minusZOrientation
        }

        return {
            position: Vec3.add(position, positionOffset),
            orientation: orientation,
            scale: {x: 1, y: 1, z: 1},
        }
    }
}

export default MazePanelTypes