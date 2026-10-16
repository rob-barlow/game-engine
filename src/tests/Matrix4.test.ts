import { describe, expect, test } from "vitest";
import { Matrix4, Vec4 } from "../main/maths";

describe('Matrix4 multiplication', () => {
    test('Matrix4 multiplication works', () => {
        const a: Matrix4 = [
            [1, 2, 3, 4 ],
            [5, 6, 7, 8 ],
            [9, 10, 11, 12 ],
            [13, 14, 15, 16 ]];

        const b: Matrix4 = [
            [16, 15, 14, 13],
            [12, 11, 10, 9],
            [8, 7, 6, 5],
            [4, 3, 2, 1]]
        
        const expected: Matrix4 = [
            [80, 70, 60, 50],
            [240, 214, 188, 162],
            [400, 358, 316, 274],
            [560, 502, 444, 386]];

        expect(Matrix4.multiply(a, b)).toEqual(expected)
    })

    test('A * I = A', () => {
        const a: Matrix4 = [
            [3, 1, 4, 1],
            [5, 9, 2, 6],
            [5, 3, 5, 8],
            [9, 7, 9, 3],
        ];

        const identity: Matrix4 = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ];

        const expected: Matrix4 = [
            [3, 1, 4, 1],
            [5, 9, 2, 6],
            [5, 3, 5, 8],
            [9, 7, 9, 3],
        ];

        expect(Matrix4.multiply(a, identity)).toEqual(expected);
    });
    
    test('Matrix4 × Vector4 works', () => {
        const m: Matrix4 = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 8, 7, 6],
            [5, 4, 3, 2],
        ];

        const v: Vec4 = {x: 1, y: 2, z: 3, w: 4};
        const expected: Vec4 = {x: 30, y: 70, z: 70, w: 30};

        expect(Matrix4.apply(m, v)).toEqual(expected);
    });

    test('Translation matrix works', () => {
        const m: Matrix4 = [
            [1, 0, 0, 10],
            [0, 1, 0, 20],
            [0, 0, 1, 30],
            [0, 0, 0, 1],
        ];
    
        const v: Vec4 = {x: 2, y: 3, z: 4, w: 1};
        const expected: Vec4 = {x: 12, y: 23, z: 34, w: 1};
    
        expect(Matrix4.apply(m, v)).toEqual(expected);
    });
    
    test('A * 0 = 0', () => {
        const a: Matrix4 = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
        ];
    
        const zero: Matrix4 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    
        const expected: Matrix4 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    
        expect(Matrix4.multiply(a, zero)).toEqual(expected);
    });
});


