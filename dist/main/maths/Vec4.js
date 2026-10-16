export const Vec4 = {
    scale(v, s) {
        return { x: v.x * s, y: v.y * s, z: v.z * s, w: v.w * s };
    },
    toVec3(v) {
        return { x: v.x, y: v.y, z: v.z };
    },
    subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z, w: a.w - b.w };
    },
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z, w: a.w + b.w };
    },
    isInViewport(v) {
        const a = v.x < v.w;
        const b = v.x > -v.w;
        const c = v.y < v.w;
        const d = v.y > -v.w;
        const e = v.z < v.w;
        const f = v.z > -v.w;
        return a && b && c && d && e && f;
    },
    equals(a, b) {
        return a.x == b.x && a.y == b.y && a.z == b.z && a.w == b.w;
    }
};
