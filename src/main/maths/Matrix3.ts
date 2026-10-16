import { Vec3 } from "./index.js";

export type Matrix3 = 
    [[number, number, number],
    [number, number, number],
    [number, number, number]];

export const Matrix3 = {
    empty(): Matrix3 {
        return [[0,0,0],[0,0,0],[0,0,0]]
    },

    identity(): Matrix3 {
        return [[1,0,0],[0,1,0],[0,0,1]]
    },

    apply(matrix: Matrix3, point: Vec3): Vec3 {
        return {
            x: matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * point.z,
            y: matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * point.z,
            z: matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * point.z,
        }
    },

    getRotationMatrix(axis: string, angle: number): Matrix3 {
        switch (axis) {
            case "x":
                return [[1, 0, 0],
                    [0, Math.cos(angle), -Math.sin(angle)],
                    [0, Math.sin(angle), Math.cos(angle)]];
            case "y":
                return [[Math.cos(angle), 0, Math.sin(angle)],
                    [0, 1, 0],
                    [-Math.sin(angle), 0, Math.cos(angle)]];
            case "z":
                    return [[Math.cos(angle), -Math.sin(angle), 0],
                    [Math.sin(angle), Math.cos(angle), 0],
                    [0, 0, 1]];
            default: 
                return this.getRotationMatrix("x", angle)
        }
    },

    multiply(a: Matrix3, b: Matrix3): Matrix3 {
        const matrix = this.empty();

        for (let rowIndex = 0; rowIndex < 3; rowIndex++){
            for (let columnIndex = 0; columnIndex < 3; columnIndex++){
                matrix[rowIndex][columnIndex] = a[rowIndex][0] * b[0][columnIndex] + a[rowIndex][1] * b[1][columnIndex] + a[rowIndex][2] * b[2][columnIndex];
            };
        };

        return matrix;
    },

    scale(m: Matrix3, s: number): Matrix3 {
        return m.map(row => {
            return row.map(val => {
                return val*s;
            });
        }) as Matrix3
    },

    transpose(m : Matrix3): Matrix3 {
        return [
            [m[0][0], m[1][0], m[2][0]],
            [m[0][1], m[1][1], m[2][1]],
            [m[0][2], m[1][2], m[2][2]]
        ]
    },

    getColumn(m: Matrix3, c: number): Vec3 {
        return {x: m[0][c], y: m[1][c], z: m[2][c]};
    }
}