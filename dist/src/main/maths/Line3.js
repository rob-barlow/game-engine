import { Vec3 } from "./index.js";
export const Line3 = {
    getViewableSegment(line) {
        const a = Vec3.add(line.pointOnLine, line.direction);
        const b = Vec3.subtract(line.pointOnLine, line.direction);
        return [a, b];
    },
    getLine(pointOnLine, otherPoint) {
        const direction = Vec3.subtract(otherPoint, pointOnLine);
        return {
            direction: direction,
            pointOnLine: pointOnLine
        };
    }
};
