import { describe, expect, test } from "vitest";
import { Matrix3 } from "../main/maths";

describe('Matrix3 multiplication', () => {
    test('Matrix3 multiplication works', () => {
        const a: Matrix3 = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];

        const b: Matrix3 = [
            [9, 8, 7],
            [6, 5, 4],
            [3, 2, 1],
        ];

        const expected: Matrix3 = [
            [30, 24, 18],
            [84, 69, 54],
            [138, 114, 90],
        ];

        expect(Matrix3.multiply(a, b)).toEqual(expected);
    });
});

describe('Matrix3 transpose', () => {
    test('Transposing a 3x3 matrix works', () => {
        const matrix: Matrix3 = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];

        const expected: Matrix3 = [
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
        ];

        expect(Matrix3.transpose(matrix)).toEqual(expected);
    });
});