import PlayerMovementSystem from "../../controls/in-game/movement-systems/PlayerMovementSystem";
import { Transform } from "../../maths/index";
import { GameObject } from "./GameObject";

export default class Player extends GameObject {
    movementSystem = new PlayerMovementSystem()
    
    constructor(transform: Transform){
        super(transform)
    }
}