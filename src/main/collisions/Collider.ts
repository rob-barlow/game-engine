import { Vec3 } from "../maths";

export default interface Collider {
    contains(position: Vec3): boolean
}

