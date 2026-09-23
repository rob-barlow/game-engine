export const Vec2 = {
    toCanvas(v, size) {
        return {
            x: (v.x + 1) * (size.width / 2),
            y: (1 - v.y) * (size.height / 2)
        };
    },
    subtract(a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        };
    },
    subtractOut(a, b, c) {
        c.x = a.x - b.x;
        c.y = a.y - b.y;
    },
    cross(a, b) {
        return (a.x * b.y) - (a.y * b.x);
    },
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    },
    scale(v, s) {
        return { x: v.x * s, y: v.y * s };
    }
};
