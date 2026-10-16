export const Matrix4 = {
    empty() {
        return [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    },
    identity() {
        return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    },
    multiply(a, b) {
        const matrix = this.empty();
        for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
            for (let columnIndex = 0; columnIndex < 4; columnIndex++) {
                matrix[rowIndex][columnIndex] = a[rowIndex][0] * b[0][columnIndex] + a[rowIndex][1] * b[1][columnIndex] + a[rowIndex][2] * b[2][columnIndex] + a[rowIndex][3] * b[3][columnIndex];
            }
        }
        return matrix;
    },
    apply(matrix, point) {
        return {
            x: matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * point.z + matrix[0][3] * point.w,
            y: matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * point.z + matrix[1][3] * point.w,
            z: matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * point.z + matrix[2][3] * point.w,
            w: matrix[3][0] * point.x + matrix[3][1] * point.y + matrix[3][2] * point.z + matrix[3][3] * point.w
        };
    },
    transpose(matrix) {
        return [
            [matrix[0][0], matrix[1][0], matrix[2][0], matrix[3][0]],
            [matrix[0][1], matrix[1][1], matrix[2][1], matrix[3][1]],
            [matrix[0][2], matrix[1][2], matrix[2][2], matrix[3][2]],
            [matrix[0][3], matrix[1][3], matrix[2][3], matrix[3][3]]
        ];
    },
    transpose3(matrix) {
        return [
            [matrix[0][0], matrix[1][0], matrix[2][0], matrix[0][3]],
            [matrix[0][1], matrix[1][1], matrix[2][1], matrix[1][3]],
            [matrix[0][2], matrix[1][2], matrix[2][2], matrix[2][3]],
            [matrix[3][0], matrix[3][1], matrix[3][2], matrix[3][3]]
        ];
    },
    changeOrder(matrix) {
        const rotationMatrix = [
            [matrix[0][0], matrix[0][1], matrix[0][2], 0],
            [matrix[1][0], matrix[1][1], matrix[1][2], 0],
            [matrix[2][0], matrix[2][1], matrix[2][2], 0],
            [0, 0, 0, matrix[3][3]]
        ];
        const translationMatrix = [
            [1, 0, 0, matrix[0][3]],
            [0, 1, 0, matrix[1][3]],
            [0, 0, 1, matrix[2][3]],
            [0, 0, 0, 1],
        ];
        return Matrix4.multiply(rotationMatrix, translationMatrix);
    }
};
