import { Vec3 } from "./Vec3.js";
import { Vec4 } from "./Vec4.js";
export const Lerp = {
    lerpNum(a, b, t) {
        return a * t + b * (1 - t);
    },
    lerpVec3(a, b, t) {
        return Vec3.add(Vec3.scale(a, t), Vec3.scale(b, 1 - t));
    },
    lerpVec4(a, b, t) {
        return Vec4.add(Vec4.scale(a, t), Vec4.scale(b, 1 - t));
    },
    lerpRasterVertex(a, b, t) {
        return { clipPosition: this.lerpVec4(a.clipPosition, b.clipPosition, t), viewZ: this.lerpNum(a.viewZ, b.viewZ, t) };
    }
};
