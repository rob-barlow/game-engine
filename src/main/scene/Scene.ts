import BoxCollider from "../collisions/BoxCollider";
import Collider from "../collisions/Collider";
import CollisionSystem from "../collisions/CollisionSystem";
import { Matrix4 } from "../maths/Matrix4";
import { Transform } from "../maths/Transform";
import { Vec3 } from "../maths/Vec3";
import { Vec4 } from "../maths/Vec4";
import { GameObject } from "./game-objects/index";

export class Scene {
    gameObjects: GameObject[] = [];
    _activeCamera?: GameObject
    collisionSystem : CollisionSystem = new CollisionSystem()

    public getBoundingBoxContaining(position: Vec3): Collider | null {
        return this.collisionSystem.getBoundingBoxContaining(position)
    }

    public add(gameObject: GameObject): void {
        this.gameObjects.push(gameObject);

        if (gameObject.collider){
            if (gameObject.collider instanceof BoxCollider){
                const boxCollider = gameObject.collider as BoxCollider

                const worldMatrix = Transform.getWorldMatrix(gameObject.transform)
                const newMin = Matrix4.apply(worldMatrix, Vec3.toVec4(boxCollider.min))
                const newMax = Matrix4.apply(worldMatrix, Vec3.toVec4(boxCollider.max))

                const transformedCollider: BoxCollider = new BoxCollider(Vec4.toVec3(newMin), Vec4.toVec3(newMax))
                this.collisionSystem.register(transformedCollider)
            }
        }
    }
    
    public setActiveCamera(camera: GameObject){
        if (this.gameObjects.includes(camera)) this._activeCamera = camera;
    }

    public get activeCamera(): GameObject {
        if (!this._activeCamera) throw new Error('No active camera has been set');
        return this._activeCamera;
    }
}