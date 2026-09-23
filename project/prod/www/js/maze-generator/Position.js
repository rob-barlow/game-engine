export const Position = {
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    },
    getSurroundingPositions(position, width, height) {
        const surroundingPositions = [];
        const directions = [
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: -1, y: 0 }
        ];
        directions.forEach(direction => {
            const resultingPosition = Position.add(position, direction);
            if (resultingPosition.x >= 0 && resultingPosition.y >= 0) {
                if (resultingPosition.x < width && resultingPosition.y < height) {
                    surroundingPositions.push(resultingPosition);
                }
            }
        });
        return surroundingPositions;
    },
    distance(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },
    toString(p) {
        return `{x: ${p.x}, y: ${p.y}}`;
    }
};
