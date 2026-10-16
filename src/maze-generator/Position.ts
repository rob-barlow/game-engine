export type Position = {
    x: number,
    y: number
}

export const Position = {
    add(a: Position, b: Position): Position {
        return {x: a.x + b.x, y: a.y + b.y};
    },

    getSurroundingPositions(position: Position, width: number, height: number): Position[] {
        const surroundingPositions: Position[] = [];
        const directions = [
            {x: 0, y: 1},
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: -1, y: 0}
        ]

        directions.forEach(direction => {
            const resultingPosition = Position.add(position, direction);
            if (resultingPosition.x >= 0 && resultingPosition.y >= 0){
                if (resultingPosition.x < width && resultingPosition.y < height){
                    surroundingPositions.push(resultingPosition);
                }
            }
        })

        return surroundingPositions;
    },

    distance(a: Position, b: Position): number {
        return Math.abs(a.x - b.x) +  Math.abs(a.y - b.y)
    },

    toString(p: Position): String {
        return `{x: ${p.x}, y: ${p.y}}`
    }
}