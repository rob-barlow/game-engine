import { Vec3 } from "../maths";
import BoxCollider from "./BoxCollider";
import Collider from "./Collider";

export default class CollisionSystem {
    colliders: BoxCollider[] = []

    register(collider: BoxCollider){
        this.colliders.push(collider)
    }

    deregister(collider: BoxCollider){
        const index = this.colliders.indexOf(collider)
        if (index !== -1) {
            this.colliders.splice(index, 1);
        }
    }

    isInBoundingBox(position: Vec3){
        return this.colliders.some(collider => collider.contains(position))
    }

    getBoundingBoxContaining(position: Vec3): Collider | null {
        let currentCollider: Collider
        for (let i = 0; i < this.colliders.length; i++){
            currentCollider = this.colliders[i]
            if (currentCollider.contains(position))
                return currentCollider
        }
        return null
    }
}