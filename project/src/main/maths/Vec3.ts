import { Matrix3, Vec2, Vec4 } from "./index.js"
import { farPlaneZ, nearPlaneZ } from "../utils/constants.js"
import { Line3 } from "./Line3.js"

export type Vec3 = {
    x: number,
    y: number,
    z: number
}

export const Vec3 = {
    empty(): Vec3 {
        return {x: 0, y: 0, z: 0}
    },

    add(a: Vec3, b: Vec3): Vec3 {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        }
    },

    subtract(a: Vec3, b: Vec3): Vec3 {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        }
    },

    scale(v: Vec3, s: number): Vec3 {
        return {
            x: v.x * s,
            y: v.y * s,
            z: v.z * s
        };
    },

    dot(a: Vec3, b: Vec3): number {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z)
    },

    cross(a: Vec3, b: Vec3): Vec3 {
        return {
            x: a.y*b.z - a.z*b.y,
            y: a.z*b.x - a.x*b.z,
            z: a.x*b.y - a.y*b.x,
        }
    },

    normalise(v: Vec3): Vec3 {
        if (this.equals(v, this.empty())){
            return v;
        }
        const size = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z, 2))
        return this.scale(v, 1/size)
    },
    
    rotate(line: Line3, point: Vec3, angle: number): Vec3 {
        // translate so line goes through origin
        const v = Vec3.subtract(point, line.pointOnLine);
        
        // formula is vrot​=vcosθ+(d×v)sinθ+d(d⋅v)(1−cosθ)
        const d = Vec3.normalise(line.direction);
    
        // vcosθ
        const section1 = Vec3.scale(v, Math.cos(angle));
        // (d×v)sinθ
        const section2 = Vec3.scale(Vec3.cross(d, v), Math.sin(angle));
        // d(d⋅v)(1−cosθ)
        const section3 = Vec3.scale(d, Vec3.dot(d, v) * (1 - Math.cos(angle)))
        
        const rotatedTranslatedPoint = Vec3.add(section1, Vec3.add(section2, section3))
    
        return Vec3.add(rotatedTranslatedPoint, line.pointOnLine)
    },

    isOutOfView(v: Vec3){
        return ((v.z < nearPlaneZ || v.z > farPlaneZ));
        //return (v.z <= 0 || v.x > v.z || v.y > v.z);
    },

    toVec4(v: Vec3, w: number = 1): Vec4 {
        return {x: v.x, y: v.y, z: v.z, w: w}; //slow
    },

    toVec2(v: Vec3): Vec2 {
        return {x: v.x, y: v.y};
    },

    equals(a: Vec3, b: Vec3): Boolean {
        return (a.x == b.x) && (a.y == b.y) && (a.z == b.z)
    },
    
    getRotationMatrix(rotation: Vec3): Matrix3 {
        const m1 = Matrix3.getRotationMatrix('x', rotation.x);
        const m2 = Matrix3.getRotationMatrix('y', rotation.y);
        const m3 = Matrix3.getRotationMatrix('z', rotation.z);

        const m2m1 = Matrix3.multiply(m2, m1);
        const m3m2m1 = Matrix3.multiply(m3, m2m1);

        return m3m2m1;
    },

    mod(v: Vec3, m: number): Vec3 {
        return {x: v.x % m, y: v.y % m, z: v.z % m}
    },

    multiply(a: Vec3, b: Vec3): Vec3 {
        return {x: a.x * b.x, y: a.y * b.y, z: a.z * b.z}
    }
}
