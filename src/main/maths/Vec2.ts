import { CanvasSize } from "../utils/types.js"

export type Vec2 = {
    x: number,
    y: number
}

export const Vec2 = {
    toCanvas(v: Vec2, size: CanvasSize): Vec2 {
        return {
            x: (v.x  + 1) * (size.width/2),
            y: (1 - v.y) * (size.height/2)
        };
    },

    subtract(a: Vec2, b: Vec2): Vec2 {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        }
    },

    subtractOut(a: Vec2, b: Vec2, c: Vec2) {
        c.x = a.x - b.x
        c.y = a.y - b.y
    },
    
    cross(a: Vec2, b: Vec2): number {
        return (a.x * b.y) - (a.y * b.x);
    },

    add(a: Vec2, b: Vec2): Vec2 {
        return {x: a.x + b.x, y: a.y + b.y};
    },

    scale(v: Vec2, s: number): Vec2 {
        return {x: v.x * s, y: v.y * s};
    }
}