import {describe, expect, test} from 'vitest';
import { Vec3 } from '../main/maths'

describe('vector addition', () => {
    test('adding vectors is successful', () => {
        const a: Vec3 = {x: 1, y: 2, z: 3};
        const b: Vec3 = {x: -3, y: -2, z: -1};
        
        const expected: Vec3 = {x: -2, y: 0, z: 2};

        expect(Vec3.add(a, b)).toEqual(expected)
    });
})

describe('vector subtraction', () => {
    test('subtracting vectors is successful', () => {
        const a: Vec3 = {x: 1, y: 2, z: 3};
        const b: Vec3 = {x: -3, y: -2, z: -1};
        
        const expected: Vec3 = {x: 4, y: 4, z: 4};
        expect(Vec3.subtract(a, b)).toEqual(expected)
    });
})

describe('vector scaling', () => {
    test('scaling a vector is successful', () => {
        const v: Vec3 = {x: 1, y: 2, z: 3};
        const s: number = 3;

        const expected: Vec3 = {x: 3, y: 6, z: 9};
        expect(Vec3.scale(v, s)).toEqual(expected)
    });
})

describe('dot product', () => {
    test('dot product is successful', () => {
        const a: Vec3 = {x: 1, y: 2, z: 3};
        const b: Vec3 = {x: -3, y: -2, z: -1};
        
        const expected: number = -10;
        expect(Vec3.dot(a, b)).toEqual(expected)
    });
})

describe('cross product', () => {
    test('cross product is successful', () => {
        const a: Vec3 = {x: 1, y: 2, z: 3};
        const b: Vec3 = {x: -3, y: -2, z: -1};
        
        const expected: Vec3 = {x: 4, y: -8, z: 4};
        expect(Vec3.cross(a, b)).toEqual(expected)
    });
})