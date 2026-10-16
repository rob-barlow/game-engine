import PlayerMovementSystem from "../../controls/in-game/movement-systems/PlayerMovementSystem.js";
import { GameObject } from "./GameObject.js";
export default class Player extends GameObject {
    movementSystem = new PlayerMovementSystem();
    constructor(transform) {
        super(transform);
    }
}
