import { Vec3 } from "./Vec3.js"

export type Vec4 = {
    x: number,
    y: number,
    z: number,
    w: number
}

export const Vec4 = {
    scale(v: Vec4, s: number): Vec4 {
        return {x: v.x * s, y: v.y * s, z: v.z * s, w: v.w * s}
    },

    toVec3(v: Vec4): Vec3 {
        return {x: v.x, y: v.y, z: v.z};
    },

    subtract(a: Vec4, b: Vec4): Vec4 {
        return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z, w: a.w - b.w}
    }, 

    add(a: Vec4, b: Vec4): Vec4 {
        return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, w: a.w + b.w}
    },

    isInViewport(v: Vec4): boolean {
        const a = v.x < v.w
        const b = v.x > -v.w
        const c = v.y < v.w
        const d = v.y > -v.w
        const e = v.z < v.w
        const f = v.z > -v.w
        return a && b && c && d && e && f
    },

    equals(a: Vec4, b: Vec4): boolean {
        return a.x == b.x && a.y == b.y && a.z == b.z && a.w == b.w
    }
}