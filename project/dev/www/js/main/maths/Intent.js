export const Intent = {
    empty() {
        return {
            xDirection: 0,
            yDirection: 0,
            zDirection: 0,
            pitch: 0,
            yaw: 0,
            roll: 0,
        };
    },
    combine(a, b) {
        return {
            xDirection: Math.min(Math.max(a.xDirection + b.xDirection, -1), 1),
            yDirection: Math.min(Math.max(a.yDirection + b.yDirection, -1), 1),
            zDirection: Math.min(Math.max(a.zDirection + b.zDirection, -1), 1),
            pitch: Math.min(Math.max(a.pitch + b.pitch, -1), 1),
            yaw: Math.min(Math.max(a.yaw + b.yaw, -1), 1),
            roll: Math.min(Math.max(a.roll + b.roll, -1), 1),
        };
    },
};
