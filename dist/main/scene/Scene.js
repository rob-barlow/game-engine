import BoxCollider from "../collisions/BoxCollider.js";
import CollisionSystem from "../collisions/CollisionSystem.js";
import { Matrix4 } from "../maths/Matrix4.js";
import { Transform } from "../maths/Transform.js";
import { Vec3 } from "../maths/Vec3.js";
import { Vec4 } from "../maths/Vec4.js";
export class Scene {
    gameObjects = [];
    _activeCamera;
    collisionSystem = new CollisionSystem();
    getBoundingBoxContaining(position) {
        return this.collisionSystem.getBoundingBoxContaining(position);
    }
    add(gameObject) {
        this.gameObjects.push(gameObject);
        if (gameObject.collider) {
            if (gameObject.collider instanceof BoxCollider) {
                const boxCollider = gameObject.collider;
                const worldMatrix = Transform.getWorldMatrix(gameObject.transform);
                const newMin = Matrix4.apply(worldMatrix, Vec3.toVec4(boxCollider.min));
                const newMax = Matrix4.apply(worldMatrix, Vec3.toVec4(boxCollider.max));
                const transformedCollider = new BoxCollider(Vec4.toVec3(newMin), Vec4.toVec3(newMax));
                this.collisionSystem.register(transformedCollider);
            }
        }
    }
    setActiveCamera(camera) {
        if (this.gameObjects.includes(camera))
            this._activeCamera = camera;
    }
    get activeCamera() {
        if (!this._activeCamera)
            throw new Error('No active camera has been set');
        return this._activeCamera;
    }
}
