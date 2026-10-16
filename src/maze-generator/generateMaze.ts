import { Maze } from "./maze.js";
import { type Position } from "./Position.js";
import { Converter } from "./Converter.js";


export function generateMaze(width: number = 10, height: number = 10): {seed: number, maze: number[][]}{
    const startPoint: Position = { x: 0, y: height/2 };
    const endPoint: Position = { x:width - 1, y: height/2 };
    
    const maze = new Maze(width,height, startPoint, endPoint);
    
    let mazeNotGenerated = true
    
    while (mazeNotGenerated) {
        mazeNotGenerated = maze.iterate();
    }
    
    const binaryInfo = Converter.toBinaryArray(maze);
    
    return {seed: maze.seed, maze: binaryInfo}
}