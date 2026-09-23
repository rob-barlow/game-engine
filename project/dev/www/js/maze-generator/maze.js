import { Random } from "./random.js";
import { Position } from "./Position.js";
export class Maze {
    width;
    height;
    seed;
    rng;
    grid;
    horizontalPathways;
    verticalPathways;
    constructor(width, height, startPoint, endPoint, seed = Date.now()) {
        // initialise random
        this.seed = seed;
        this.rng = new Random(seed);
        // initialise grid    
        this.width = width;
        this.height = height;
        this.grid = new Grid(width, height, "O");
        this.verticalPathways = new Grid(width, height - 1, " ");
        this.horizontalPathways = new Grid(width - 1, height, " ");
        this.updateToMazePiece(startPoint, "A");
        this.grid.setPosition(endPoint, "Z");
    }
    updateToMazePiece(position, value = "X") {
        try {
            this.grid.setPosition(position, value);
            const surroundingPositions = Position.getSurroundingPositions(position, this.width, this.height);
            surroundingPositions.forEach(newPosition => {
                if (this.grid.getValueAtPosition(newPosition) == "O") {
                    this.grid.setPosition(newPosition, "F");
                }
            });
        }
        catch {
            console.log("Position was: " + position);
        }
    }
    iterate() {
        const positions = this.grid.where(val => val == "F");
        if (positions.length == 0) {
            this.connectFinish();
            return false;
        }
        const newMazePositionIndex = this.rng.randomInt(0, positions.length - 1);
        const newMazePosition = positions[newMazePositionIndex];
        // find surrounding maze pieces and pick one at random
        const surroundingMazePieces = this.grid.where(val => val == "X" || val == "A").filter(position => {
            return Position.distance(position, newMazePosition) == 1;
        });
        const newMazePathwayIndex = this.rng.randomInt(0, surroundingMazePieces.length - 1);
        const newMazePathway = surroundingMazePieces[newMazePathwayIndex];
        this.addPathway(newMazePosition, newMazePathway);
        this.updateToMazePiece(newMazePosition);
        return true;
    }
    connectFinish() {
        const finishPosition = this.grid.where(val => val == "Z")[0];
        const surroundingMazePieces = this.grid.where(val => val == "X").filter(position => {
            return Position.distance(position, finishPosition) == 1;
        });
        const newMazePathwayIndex = this.rng.randomInt(0, surroundingMazePieces.length - 1);
        const newMazePathway = surroundingMazePieces[newMazePathwayIndex];
        this.addPathway(finishPosition, newMazePathway);
    }
    addPathway(a, b) {
        if (a.x == b.x) {
            const topPosition = [a, b].sort((a, b) => a.y - b.y)[0];
            this.verticalPathways.setPosition(topPosition, "|");
        }
        else {
            const leftPosition = [a, b].sort((a, b) => { return a.x - b.x; })[0];
            this.horizontalPathways.setPosition(leftPosition, "-");
        }
    }
}
export class Grid {
    width;
    height;
    grid;
    constructor(width, height, fillCharacter) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height }, () => Array(width).fill(fillCharacter));
    }
    getValueAtPosition(position) {
        return this.grid[position.y][position.x];
    }
    setPosition(position, value) {
        this.grid[position.y][position.x] = value;
    }
    where(predicate) {
        const positions = [];
        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                const currentPosition = { x: column, y: row };
                if (predicate(this.getValueAtPosition(currentPosition))) {
                    positions.push(currentPosition);
                }
            }
        }
        return positions;
    }
}
