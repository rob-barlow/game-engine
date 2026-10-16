import { RasterVertex } from "./RasterVertex"
import { Vec3 } from "./Vec3"
import { Vec4 } from "./Vec4"

export const Lerp = {
    lerpNum(a: number, b: number, t: number): number{
        return a * t + b * (1 - t)
    },

    lerpVec3(a: Vec3, b: Vec3, t: number): Vec3{
        return Vec3.add(Vec3.scale(a, t), Vec3.scale(b, 1 - t))
    },

    lerpVec4(a: Vec4, b: Vec4, t: number): Vec4{
        return Vec4.add(Vec4.scale(a, t), Vec4.scale(b, 1 - t))
    },

    lerpRasterVertex(a: RasterVertex, b: RasterVertex, t: number): RasterVertex{
        return {clipPosition: this.lerpVec4(a.clipPosition, b.clipPosition, t), viewZ: this.lerpNum(a.viewZ, b.viewZ, t)}
    }
}