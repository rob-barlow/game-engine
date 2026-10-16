import { Maze } from "./maze.js";
import { Converter } from "./Converter.js";
export function generateMaze(width = 10, height = 10) {
    const startPoint = { x: 0, y: height / 2 };
    const endPoint = { x: width - 1, y: height / 2 };
    const maze = new Maze(width, height, startPoint, endPoint);
    let mazeNotGenerated = true;
    while (mazeNotGenerated) {
        mazeNotGenerated = maze.iterate();
    }
    const binaryInfo = Converter.toBinaryArray(maze);
    return { seed: maze.seed, maze: binaryInfo };
}
