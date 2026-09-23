import { Vec3 } from "./index.js"

export type Line3 = {
    direction: Vec3,
    pointOnLine: Vec3
}

export const Line3 = {
    getViewableSegment(line: Line3): [Vec3, Vec3] {
        const a = Vec3.add(line.pointOnLine, line.direction);
        const b = Vec3.subtract(line.pointOnLine, line.direction);
        return [a, b];
    },

    getLine(pointOnLine: Vec3, otherPoint: Vec3): Line3 {
        const direction = Vec3.subtract(otherPoint, pointOnLine);
        return {
            direction: direction,
            pointOnLine: pointOnLine
        };
    }
}