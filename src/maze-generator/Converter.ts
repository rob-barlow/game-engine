import { Maze } from "./maze.js";

export const Converter = {
    toBinaryArray(maze: Maze): number[][]{
        const mazeArray: number[][] = Array.from({ length: (2 * maze.height) - 1 }, () => Array((2 * maze.width) - 1).fill(1));

        for (let x = 0; x < maze.width; x++){
            for (let y = 0; y < maze.height; y++){
                mazeArray[(2 * y)][2 * x] = this.mazeStringToNumber(maze.grid.grid[y][x])

                if (y != (maze.height - 1)){
                    mazeArray[(2 * y) + 1][2 * x] = this.mazeStringToNumber(maze.verticalPathways.grid[y][x])
                }
                
                if (x != (maze.width - 1)){
                    mazeArray[(2 * y)][(2 * x) + 1] = this.mazeStringToNumber(maze.horizontalPathways.grid[y][x])
                }
            }
        }

        const outline: number[][] =  Array.from({ length: (2 * maze.height) + 1 }, () => Array((2 * maze.width) + 1).fill(1));

        for (let row = 1; row < (2 * maze.height); row++){
            for (let column = 1; column < (2 * maze.width); column++){
                outline[row][column] = mazeArray[row-1][column - 1]
            }
        }

        return outline;
    },

    mazeStringToNumber(value: String): number {
        // 1 = wall, 0 = space

        if (value == " ")
            return 1;

        if (value == "A")
            return 2;

        
        if (value == "Z")
            return 3;

        return 0;
    }
}